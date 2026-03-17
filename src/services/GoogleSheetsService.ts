import AsyncStorage from '@react-native-async-storage/async-storage';
import { SyncResult } from '../types/googleSheets';
import { Transaction, Category, SubCategory, PaymentMethod } from '../types';
import { SHEETS_API, SHEET_NAMES, CELL_RANGES } from '../constants/googleSheets';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { IGoogleSheetsService } from './interfaces/IGoogleSheetsService';

export interface GoogleSheetsServiceDeps {
  getAccessToken: () => Promise<string | null>;
  transactionService: {
    getAll(): Transaction[];
    create(input: Omit<Transaction, 'id'>): Transaction;
    delete(id: string): boolean;
  };
  categoryService: {
    getAll(): Category[];
    getByType(type: 'income' | 'expense'): Category[];
    create(input: Omit<Category, 'id'>): Category;
  };
  subCategoryService: {
    getAll(): SubCategory[];
    getByCategoryId(categoryId: string): SubCategory[];
    create(input: Omit<SubCategory, 'id'>): SubCategory;
  };
  paymentMethodService: {
    getAll(): PaymentMethod[];
    create(input: Omit<PaymentMethod, 'id'>): PaymentMethod;
  };
}

/**
 * Google Sheets 서비스 구현체
 * Google Sheets API v4를 통한 데이터 동기화 기능 제공
 */
export class GoogleSheetsService implements IGoogleSheetsService {
  private spreadsheetId: string | null = null;
  private lastSyncTime: Date | null = null;
  private deps: GoogleSheetsServiceDeps;

  constructor(deps: GoogleSheetsServiceDeps) {
    this.deps = deps;
  }

  /**
   * AsyncStorage에서 저장된 상태 복원
   */
  async initialize(): Promise<void> {
    const storedId = await AsyncStorage.getItem(STORAGE_KEYS.SPREADSHEET_ID);
    if (storedId) {
      this.spreadsheetId = storedId;
    }

    const storedSync = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    if (storedSync) {
      this.lastSyncTime = new Date(storedSync);
    }
  }

  async setSpreadsheetId(id: string): Promise<void> {
    this.spreadsheetId = id;
    await AsyncStorage.setItem(STORAGE_KEYS.SPREADSHEET_ID, id);
  }

  getSpreadsheetId(): string | null {
    return this.spreadsheetId;
  }

  getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }

  async testConnection(): Promise<boolean> {
    try {
      const token = await this.deps.getAccessToken();
      if (!token || !this.spreadsheetId) return false;

      const url = `${SHEETS_API.BASE_URL}/${this.spreadsheetId}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  // ========== Export ==========

  async exportAll(): Promise<SyncResult> {
    const token = await this.deps.getAccessToken();
    if (!token) {
      throw new Error('인증이 필요합니다');
    }

    try {
      // 설정 데이터 준비
      const categories = this.deps.categoryService.getByType('expense');
      const subCategories = this.deps.subCategoryService.getAll();
      const paymentMethods = this.deps.paymentMethodService.getAll();

      if (categories.length === 0) {
        return this.createSyncResult(
          'error',
          '내보낼 지출 카테고리가 없습니다. 설정을 먼저 가져오기 해주세요.'
        );
      }

      // 카테고리 매트릭스 (각 행을 10열로 패딩 — E~N열)
      const maxCategoryCols = 16; // E41:T50 = 16열 (대분류 1 + 소분류 최대 15)
      const maxCategoryRows = 10; // 10행
      const categoryMatrix = categories.map((cat) => {
        const subs = subCategories.filter((sc) => sc.categoryId === cat.id);
        const subNames = subs.map((sc) =>
          sc.icon ? `${sc.icon}${sc.name}` : sc.name
        );
        const row = [cat.name, ...subNames] as (string | number | null)[];
        while (row.length < maxCategoryCols) row.push('');
        return row;
      });
      while (categoryMatrix.length < maxCategoryRows) {
        categoryMatrix.push(new Array(maxCategoryCols).fill(''));
      }

      // 결제수단 (패딩 포함)
      const maxPaymentRows = 5;
      const creditCards = paymentMethods
        .filter((pm) => pm.type === 'credit')
        .map((pm) => [pm.name] as (string | number | null)[]);
      while (creditCards.length < maxPaymentRows) creditCards.push(['']);
      const debitAndCash = paymentMethods
        .filter((pm) => pm.type !== 'credit')
        .map((pm) => [pm.name] as (string | number | null)[]);
      while (debitAndCash.length < maxPaymentRows) debitAndCash.push(['']);

      // 거래 데이터에서 연도 자동 감지 (시트가 해당 연도용이므로)
      const allTransactions = this.deps.transactionService.getAll();
      const allCategories = this.deps.categoryService.getAll();
      const year = this.detectYear(allTransactions);
      let totalExported = 0;

      // batchUpdate용 데이터 배열 구성 (설정 + 12개월 거래 = 1번의 API 호출)
      const batchData: { range: string; values: (string | number | null)[][] }[] = [
        { range: CELL_RANGES.CATEGORIES, values: categoryMatrix },
        { range: CELL_RANGES.PAYMENT_CREDIT, values: creditCards },
        { range: CELL_RANGES.PAYMENT_DEBIT, values: debitAndCash },
      ];

      for (let month = 1; month <= 12; month++) {
        const monthTransactions = allTransactions.filter((t) => {
          const d = t.date;
          return d.getFullYear() === year && d.getMonth() + 1 === month;
        });

        const monthName = SHEET_NAMES.MONTHS[month - 1];

        // 지출 거래
        const expenseRows = monthTransactions
          .filter((t) => t.type === 'expense')
          .map((t) => this.transactionToExpenseRow(t, allCategories, subCategories, paymentMethods));

        // 동적 패딩: 실제 데이터 + 여유 10행 (최소 20행, 기존 데이터 덮어쓰기용)
        const paddingTarget = Math.max(expenseRows.length + 10, 20);
        while (expenseRows.length < paddingTarget) {
          expenseRows.push(['', '', '', '', '', '']);
        }
        batchData.push({
          range: CELL_RANGES.EXPENSE_TRANSACTIONS(monthName),
          values: expenseRows,
        });

        // 수입 거래
        const incomeRows = this.aggregateIncomeByCategory(
          monthTransactions.filter((t) => t.type === 'income'),
          allCategories
        );
        const maxIncomeRows = 5;
        while (incomeRows.length < maxIncomeRows) {
          incomeRows.push(['', '', '']);
        }
        batchData.push({
          range: CELL_RANGES.INCOME_DETAILS(monthName),
          values: incomeRows,
        });

        totalExported += monthTransactions.length;
      }

      // 단 1번의 API 호출로 전체 내보내기
      await this.batchWrite(batchData);
      await this.updateLastSyncTime();

      return this.createSyncResult('success', `전체 내보내기 완료 (${year}년 ${totalExported}건)`, {
        transactions: totalExported,
      });
    } catch (error) {
      return this.createSyncResult(
        'error',
        `내보내기 실패: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async exportTransactions(year: number, month: number): Promise<SyncResult> {
    const token = await this.deps.getAccessToken();
    if (!token) {
      throw new Error('인증이 필요합니다');
    }

    try {
      const allTransactions = this.deps.transactionService.getAll();
      const monthTransactions = allTransactions.filter((t) => {
        const d = t.date;
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      });

      const categories = this.deps.categoryService.getAll();
      const subCategories = this.deps.subCategoryService.getAll();
      const paymentMethods = this.deps.paymentMethodService.getAll();

      const expenseRows = monthTransactions
        .filter((t) => t.type === 'expense')
        .map((t) => this.transactionToExpenseRow(t, categories, subCategories, paymentMethods));
      const incomeRows = this.aggregateIncomeByCategory(
        monthTransactions.filter((t) => t.type === 'income'),
        categories
      );

      const monthName = SHEET_NAMES.MONTHS[month - 1];

      // 동적 패딩 후 batchWrite (1번 호출)
      const paddingTarget = Math.max(expenseRows.length + 10, 20);
      while (expenseRows.length < paddingTarget) expenseRows.push(['', '', '', '', '', '']);
      const maxIncomeRows = 5;
      while (incomeRows.length < maxIncomeRows) incomeRows.push(['', '', '']);

      await this.batchWrite([
        { range: CELL_RANGES.EXPENSE_TRANSACTIONS(monthName), values: expenseRows },
        { range: CELL_RANGES.INCOME_DETAILS(monthName), values: incomeRows },
      ]);

      await this.updateLastSyncTime();

      return this.createSyncResult(
        'success',
        `${year}년 ${month}월 거래 내보내기 완료`,
        { transactions: monthTransactions.length }
      );
    } catch (error) {
      return this.createSyncResult(
        'error',
        `거래 내보내기 실패: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async exportSettings(): Promise<SyncResult> {
    const token = await this.deps.getAccessToken();
    if (!token) {
      throw new Error('인증이 필요합니다');
    }

    try {
      const categories = this.deps.categoryService.getByType('expense');
      const subCategories = this.deps.subCategoryService.getAll();
      const paymentMethods = this.deps.paymentMethodService.getAll();

      if (categories.length === 0) {
        return this.createSyncResult(
          'error',
          '내보낼 지출 카테고리가 없습니다. 설정을 먼저 가져오기 해주세요.'
        );
      }

      const maxCategoryCols = 10;
      const maxCategoryRows = 10;
      const categoryMatrix = categories.map((cat) => {
        const subs = subCategories.filter((sc) => sc.categoryId === cat.id);
        const subNames = subs.map((sc) =>
          sc.icon ? `${sc.icon}${sc.name}` : sc.name
        );
        const row = [cat.name, ...subNames] as (string | number | null)[];
        while (row.length < maxCategoryCols) row.push('');
        return row;
      });
      while (categoryMatrix.length < maxCategoryRows) {
        categoryMatrix.push(new Array(maxCategoryCols).fill(''));
      }

      const maxPaymentRows = 5;
      const creditCards = paymentMethods
        .filter((pm) => pm.type === 'credit')
        .map((pm) => [pm.name] as (string | number | null)[]);
      while (creditCards.length < maxPaymentRows) creditCards.push(['']);
      const debitAndCash = paymentMethods
        .filter((pm) => pm.type !== 'credit')
        .map((pm) => [pm.name] as (string | number | null)[]);
      while (debitAndCash.length < maxPaymentRows) debitAndCash.push(['']);

      // 단 1번의 API 호출
      await this.batchWrite([
        { range: CELL_RANGES.CATEGORIES, values: categoryMatrix },
        { range: CELL_RANGES.PAYMENT_CREDIT, values: creditCards },
        { range: CELL_RANGES.PAYMENT_DEBIT, values: debitAndCash },
      ]);

      await this.updateLastSyncTime();

      return this.createSyncResult('success', '설정 내보내기 완료', {
        categories: categories.length,
        paymentMethods: paymentMethods.length,
        subCategories: subCategories.length,
      });
    } catch (error) {
      return this.createSyncResult(
        'error',
        `설정 내보내기 실패: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // ========== Import ==========

  async importAll(): Promise<SyncResult> {
    const token = await this.deps.getAccessToken();
    if (!token) {
      throw new Error('인증이 필요합니다');
    }

    try {
      // 1번의 batchGet으로 연도 + 설정 + 12개월 거래를 모두 읽기
      const ranges: string[] = [
        "'(필수)설정 시트'!B2",  // 연도 셀
        CELL_RANGES.CATEGORIES,
        CELL_RANGES.PAYMENT_CREDIT,
        CELL_RANGES.PAYMENT_DEBIT,
      ];
      for (let month = 1; month <= 12; month++) {
        const monthName = SHEET_NAMES.MONTHS[month - 1];
        ranges.push(CELL_RANGES.EXPENSE_TRANSACTIONS(monthName));
        ranges.push(CELL_RANGES.INCOME_DETAILS(monthName));
      }

      const allData = await this.batchRead(ranges);

      // 연도 추출 (인덱스 0)
      const yearData = allData[0] || [];
      const year = yearData[0]?.[0] ? Number(yearData[0][0]) : new Date().getFullYear();

      // 설정 처리 (인덱스 1, 2, 3)
      const settingsResult = this.processImportSettings(
        allData[1] || [],
        allData[2] || [],
        allData[3] || []
      );

      // 거래 처리 (인덱스 4부터 2개씩: expense, income)
      let totalImported = 0;
      for (let month = 1; month <= 12; month++) {
        const dataIndex = 4 + (month - 1) * 2;
        const expenseRows = allData[dataIndex] || [];
        const incomeRows = allData[dataIndex + 1] || [];

        const imported = await this.processImportTransactions(
          year,
          month,
          expenseRows,
          incomeRows
        );
        totalImported += imported;
      }

      await this.updateLastSyncTime();

      return this.createSyncResult('success', `전체 가져오기 완료 (${year}년 ${totalImported}건)`, {
        transactions: totalImported,
        ...settingsResult,
      });
    } catch (error) {
      return this.createSyncResult(
        'error',
        `가져오기 실패: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async importTransactions(year: number, month: number): Promise<SyncResult> {
    const token = await this.deps.getAccessToken();
    if (!token) {
      throw new Error('인증이 필요합니다');
    }

    try {
      const monthName = SHEET_NAMES.MONTHS[month - 1];

      // 1번의 batchGet으로 지출+수입 동시 읽기
      const allData = await this.batchRead([
        CELL_RANGES.EXPENSE_TRANSACTIONS(monthName),
        CELL_RANGES.INCOME_DETAILS(monthName),
      ]);

      const imported = await this.processImportTransactions(
        year,
        month,
        allData[0] || [],
        allData[1] || []
      );

      await this.updateLastSyncTime();

      return this.createSyncResult(
        'success',
        `${year}년 ${month}월 거래 가져오기 완료`,
        { transactions: imported }
      );
    } catch (error) {
      return this.createSyncResult(
        'error',
        `거래 가져오기 실패: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async importSettings(): Promise<SyncResult> {
    const token = await this.deps.getAccessToken();
    if (!token) {
      throw new Error('인증이 필요합니다');
    }

    try {
      // 1번의 batchGet으로 설정 전체 읽기
      const allData = await this.batchRead([
        CELL_RANGES.CATEGORIES,
        CELL_RANGES.PAYMENT_CREDIT,
        CELL_RANGES.PAYMENT_DEBIT,
      ]);

      const result = this.processImportSettings(
        allData[0] || [],
        allData[1] || [],
        allData[2] || []
      );

      await this.updateLastSyncTime();

      return this.createSyncResult('success', '설정 가져오기 완료', result);
    } catch (error) {
      return this.createSyncResult(
        'error',
        `설정 가져오기 실패: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // ========== Private: Import Processing ==========

  private processImportSettings(
    categoryRows: (string | number | null)[][],
    creditRows: (string | number | null)[][],
    debitRows: (string | number | null)[][]
  ): { categories: number; subCategories: number; paymentMethods: number } {
    let categoriesImported = 0;
    let subCategoriesImported = 0;
    let paymentMethodsImported = 0;

    for (const row of categoryRows) {
      if (!row || row.length === 0 || !row[0]) continue;

      const categoryName = String(row[0]);
      let category = this.deps.categoryService
        .getByType('expense')
        .find((c: Category) => c.name === categoryName);

      if (!category) {
        category = this.deps.categoryService.create({
          name: categoryName,
          type: 'expense',
        });
        categoriesImported++;
      }

      for (let i = 1; i < row.length; i++) {
        const cellValue = row[i];
        if (!cellValue) continue;

        const subName = String(cellValue);
        const parsed = this.parseSubCategoryName(subName);

        const existingSub = this.deps.subCategoryService
          .getByCategoryId(category.id)
          .find((sc: SubCategory) => sc.name === parsed.name);

        if (!existingSub) {
          this.deps.subCategoryService.create({
            categoryId: category.id,
            name: parsed.name,
            icon: parsed.icon,
          });
          subCategoriesImported++;
        }
      }
    }

    for (const row of creditRows) {
      if (!row || !row[0]) continue;
      const name = String(row[0]);
      const existing = this.deps.paymentMethodService
        .getAll()
        .find((pm: PaymentMethod) => pm.name === name);
      if (!existing) {
        this.deps.paymentMethodService.create({ name, type: 'credit' });
        paymentMethodsImported++;
      }
    }

    for (const row of debitRows) {
      if (!row || !row[0]) continue;
      const name = String(row[0]);
      if (name === '현금') {
        const existing = this.deps.paymentMethodService
          .getAll()
          .find((pm: PaymentMethod) => pm.name === name);
        if (!existing) {
          this.deps.paymentMethodService.create({ name, type: 'cash' });
          paymentMethodsImported++;
        }
      } else {
        const existing = this.deps.paymentMethodService
          .getAll()
          .find((pm: PaymentMethod) => pm.name === name);
        if (!existing) {
          this.deps.paymentMethodService.create({ name, type: 'debit' });
          paymentMethodsImported++;
        }
      }
    }

    return { categories: categoriesImported, subCategories: subCategoriesImported, paymentMethods: paymentMethodsImported };
  }

  private async processImportTransactions(
    year: number,
    month: number,
    expenseRows: (string | number | null)[][],
    incomeRows: (string | number | null)[][]
  ): Promise<number> {
    // 기존 해당 월 거래 삭제
    const existingTransactions = this.deps.transactionService.getAll().filter((t) => {
      const d = t.date;
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
    for (const t of existingTransactions) {
      this.deps.transactionService.delete(t.id);
    }

    let importedCount = 0;

    for (const row of expenseRows) {
      if (!row || row.length === 0 || !row[0]) continue;
      const transaction = await this.expenseRowToTransaction(row, year, month);
      if (transaction) {
        this.deps.transactionService.create(transaction);
        importedCount++;
      }
    }

    for (const row of incomeRows) {
      if (!row || row.length === 0 || !row[0]) continue;
      const transaction = await this.incomeRowToTransaction(row, year, month);
      if (transaction) {
        this.deps.transactionService.create(transaction);
        importedCount++;
      }
    }

    return importedCount;
  }

  // ========== Private: API Methods ==========

  private async batchRead(
    ranges: string[]
  ): Promise<(string | number | null)[][][]> {
    const token = await this.deps.getAccessToken();
    if (!token) throw new Error('인증이 필요합니다');

    const params = ranges.map((r) => `ranges=${encodeURIComponent(r)}`).join('&');
    const url = `${SHEETS_API.BASE_URL}/${this.spreadsheetId}/values:batchGet?${params}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('인증이 만료되었습니다');
      const errorBody = await response.json().catch(() => ({}));
      const errorMsg = errorBody?.error?.message || JSON.stringify(errorBody);
      throw new Error(`batchGet API 오류 ${response.status}: ${errorMsg}`);
    }

    const data = await response.json();
    return (data.valueRanges || []).map(
      (vr: { values?: (string | number | null)[][] }) => vr.values || []
    );
  }

  private async batchWrite(
    data: { range: string; values: (string | number | null)[][] }[]
  ): Promise<void> {
    const token = await this.deps.getAccessToken();
    if (!token) throw new Error('인증이 필요합니다');

    const url = `${SHEETS_API.BASE_URL}/${this.spreadsheetId}/values:batchUpdate`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: data.map((d) => ({ range: d.range, values: d.values })),
      }),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('인증이 만료되었습니다');
      const errorBody = await response.json().catch(() => ({}));
      const errorMsg = errorBody?.error?.message || JSON.stringify(errorBody);
      throw new Error(`batchUpdate API 오류 ${response.status}: ${errorMsg}`);
    }
  }

  async readRange(range: string): Promise<(string | number | null)[][]> {
    const token = await this.deps.getAccessToken();
    if (!token) throw new Error('인증이 필요합니다');

    const url = `${SHEETS_API.BASE_URL}/${this.spreadsheetId}/values/${encodeURIComponent(range)}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('인증이 만료되었습니다');
      }
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();
    return data.values || [];
  }

  async writeRange(
    range: string,
    values: (string | number | null)[][]
  ): Promise<void> {
    const token = await this.deps.getAccessToken();
    if (!token) throw new Error('인증이 필요합니다');

    const url = `${SHEETS_API.BASE_URL}/${this.spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('인증이 만료되었습니다');
      }
      throw new Error(`API 오류: ${response.status}`);
    }
  }

  async clearRange(range: string): Promise<void> {
    const token = await this.deps.getAccessToken();
    if (!token) throw new Error('인증이 필요합니다');

    const url = `${SHEETS_API.BASE_URL}/${this.spreadsheetId}/values/${encodeURIComponent(range)}:clear`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('인증이 만료되었습니다');
      }
      throw new Error(`API 오류: ${response.status}`);
    }
  }

  // ========== Private: Data Conversion ==========

  private transactionToExpenseRow(
    transaction: Transaction,
    categories: Category[],
    subCategories: SubCategory[],
    paymentMethods: PaymentMethod[]
  ): (string | number | null)[] {
    const day = transaction.date.getDate();
    const category = categories.find((c) => c.id === transaction.categoryId);
    const categoryName = category?.name || '';

    let subCategoryDisplay = '';
    if (transaction.subCategoryId) {
      const subCategory = subCategories.find(
        (sc) => sc.id === transaction.subCategoryId
      );
      if (subCategory) {
        subCategoryDisplay = subCategory.icon
          ? `${subCategory.icon}${subCategory.name}`
          : subCategory.name;
      }
    }

    const paymentMethod = paymentMethods.find(
      (pm) => pm.id === transaction.paymentMethodId
    );
    const paymentMethodName = paymentMethod?.name || '';

    return [
      day,
      categoryName,
      subCategoryDisplay,
      transaction.amount,
      paymentMethodName,
      transaction.memo || '',
    ];
  }

  private aggregateIncomeByCategory(
    transactions: Transaction[],
    categories: Category[]
  ): (string | number | null)[][] {
    const categoryMap = new Map<string, number>();

    for (const t of transactions) {
      const current = categoryMap.get(t.categoryId) || 0;
      categoryMap.set(t.categoryId, current + t.amount);
    }

    const rows: (string | number | null)[][] = [];
    categoryMap.forEach((amount, categoryId) => {
      const category = categories.find((c) => c.id === categoryId);
      const categoryName = category?.name || '';
      rows.push([categoryName, amount, '']);
    });

    return rows;
  }

  private async expenseRowToTransaction(
    row: (string | number | null)[],
    year: number,
    month: number
  ): Promise<{
    type: 'expense';
    amount: number;
    date: Date;
    categoryId: string;
    subCategoryId?: string;
    paymentMethodId: string;
    memo?: string;
  } | null> {
    // row = [day, categoryName, subCategoryDisplay, amount, paymentMethodName, memo]
    const day = Number(row[0]);
    const categoryName = String(row[1] || '');
    const subCategoryDisplay = String(row[2] || '');
    const amount = Number(row[3]);
    const paymentMethodName = String(row[4] || '');
    const memo = row[5] ? String(row[5]) : undefined;

    if (!day || !amount) return null;

    // 대분류 이름 → ID
    const categoryId = await this.findOrCreateCategory(categoryName, 'expense');

    // 소분류 파싱 및 매칭
    let subCategoryId: string | undefined;
    if (subCategoryDisplay) {
      const parsed = this.parseSubCategoryName(subCategoryDisplay);
      subCategoryId = await this.findOrCreateSubCategory(
        categoryId,
        parsed.name,
        parsed.icon
      );
    }

    // 결제수단 매칭
    const paymentMethodId =
      await this.findOrCreatePaymentMethod(paymentMethodName);

    const date = new Date(year, month - 1, day);

    return {
      type: 'expense',
      amount,
      date,
      categoryId,
      subCategoryId,
      paymentMethodId,
      memo,
    };
  }

  private async incomeRowToTransaction(
    row: (string | number | null)[],
    year: number,
    month: number
  ): Promise<{
    type: 'income';
    amount: number;
    date: Date;
    categoryId: string;
    paymentMethodId: string;
    memo?: string;
  } | null> {
    // row = [categoryName, amount, memo]
    const categoryName = String(row[0] || '');
    const amount = Number(row[1]);
    const memo = row[2] ? String(row[2]) : undefined;

    if (!categoryName || !amount) return null;

    const categoryId = await this.findOrCreateCategory(categoryName, 'income');

    // 수입은 기본 결제수단 사용
    const paymentMethods = this.deps.paymentMethodService.getAll();
    const paymentMethodId = paymentMethods[0]?.id || 'default';

    const date = new Date(year, month - 1, 1);

    return {
      type: 'income',
      amount,
      date,
      categoryId,
      paymentMethodId,
      memo,
    };
  }

  private async findOrCreateCategory(
    name: string,
    type: 'income' | 'expense'
  ): Promise<string> {
    const existing = this.deps.categoryService
      .getByType(type)
      .find((c: Category) => c.name === name);
    if (existing) return existing.id;

    const created = this.deps.categoryService.create({ name, type });
    return created.id;
  }

  private async findOrCreateSubCategory(
    categoryId: string,
    name: string,
    icon?: string
  ): Promise<string> {
    const existing = this.deps.subCategoryService
      .getByCategoryId(categoryId)
      .find((sc: SubCategory) => sc.name === name);
    if (existing) return existing.id;

    const created = this.deps.subCategoryService.create({ categoryId, name, icon });
    return created.id;
  }

  private async findOrCreatePaymentMethod(name: string): Promise<string> {
    const existing = this.deps.paymentMethodService
      .getAll()
      .find((pm: PaymentMethod) => pm.name === name);
    if (existing) return existing.id;

    const created = this.deps.paymentMethodService.create({ name });
    return created.id;
  }

  /**
   * 이모지 포함 소분류 이름 파싱
   * 예: "🍔햄버거" → { icon: "🍔", name: "햄버거" }
   * 예: "햄버거" → { icon: undefined, name: "햄버거" }
   */
  private parseSubCategoryName(display: string): {
    icon?: string;
    name: string;
  } {
    // 이모지 패턴: 유니코드 이모지 (서로게이트 페어 포함)
    const emojiRegex =
      /^([\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1FAFF}\u{200D}\u{20E3}]+)/u;
    const match = display.match(emojiRegex);

    if (match) {
      return {
        icon: match[1],
        name: display.slice(match[1].length),
      };
    }

    return { name: display };
  }

  // ========== Private: Helpers ==========

  /**
   * 거래 데이터에서 가장 많이 사용된 연도를 감지
   * 거래가 없으면 현재 연도 반환
   */
  private detectYear(transactions: Transaction[]): number {
    if (transactions.length === 0) return new Date().getFullYear();

    const yearCounts = new Map<number, number>();
    for (const t of transactions) {
      const y = t.date.getFullYear();
      yearCounts.set(y, (yearCounts.get(y) || 0) + 1);
    }

    let maxYear = new Date().getFullYear();
    let maxCount = 0;
    yearCounts.forEach((count, year) => {
      if (count > maxCount) {
        maxCount = count;
        maxYear = year;
      }
    });

    return maxYear;
  }

  private async updateLastSyncTime(): Promise<void> {
    this.lastSyncTime = new Date();
    await AsyncStorage.setItem(
      STORAGE_KEYS.LAST_SYNC,
      this.lastSyncTime.toISOString()
    );
  }

  private createSyncResult(
    status: 'success' | 'error',
    message: string,
    counts?: Partial<{
      transactions: number;
      categories: number;
      subCategories: number;
      paymentMethods: number;
      incomeTargets: number;
      savings: number;
      bankAccounts: number;
    }>
  ): SyncResult {
    return {
      status,
      message,
      timestamp: new Date(),
      recordCounts: counts
        ? {
            transactions: counts.transactions || 0,
            categories: counts.categories || 0,
            subCategories: counts.subCategories || 0,
            paymentMethods: counts.paymentMethods || 0,
            incomeTargets: counts.incomeTargets || 0,
            savings: counts.savings || 0,
            bankAccounts: counts.bankAccounts || 0,
          }
        : undefined,
    };
  }
}
