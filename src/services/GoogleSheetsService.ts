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
      // 설정 내보내기
      await this.exportSettings();

      // 전체 12개월 거래 내보내기
      const now = new Date();
      const year = now.getFullYear();
      let totalExported = 0;

      for (let month = 1; month <= 12; month++) {
        const result = await this.exportTransactions(year, month);
        if (result.details?.transactions) {
          totalExported += result.details.transactions;
        }
      }

      await this.updateLastSyncTime();

      return this.createSyncResult('success', `전체 내보내기 완료 (${totalExported}건)`, {
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

      // 지출 거래 → 시트 행 변환
      const expenseTransactions = monthTransactions.filter(
        (t) => t.type === 'expense'
      );
      const expenseRows = expenseTransactions.map((t) =>
        this.transactionToExpenseRow(t, categories, subCategories, paymentMethods)
      );

      // 수입 거래 → 카테고리별 합산
      const incomeTransactions = monthTransactions.filter(
        (t) => t.type === 'income'
      );
      const incomeRows = this.aggregateIncomeByCategory(
        incomeTransactions,
        categories
      );

      const monthName = SHEET_NAMES.MONTHS[month - 1];

      // 기존 데이터 클리어 후 쓰기
      const expenseRange = CELL_RANGES.EXPENSE_TRANSACTIONS(monthName);
      await this.clearRange(expenseRange);
      if (expenseRows.length > 0) {
        await this.writeRange(expenseRange, expenseRows);
      }

      const incomeRange = CELL_RANGES.INCOME_DETAILS(monthName);
      await this.clearRange(incomeRange);
      if (incomeRows.length > 0) {
        await this.writeRange(incomeRange, incomeRows);
      }

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

      // 카테고리 매트릭스 변환: 각 행 = [대분류명, 소분류1, 소분류2, ...]
      const categoryMatrix = categories.map((cat) => {
        const subs = subCategories.filter((sc) => sc.categoryId === cat.id);
        const subNames = subs.map((sc) =>
          sc.icon ? `${sc.icon}${sc.name}` : sc.name
        );
        return [cat.name, ...subNames] as (string | number | null)[];
      });

      // 결제수단 변환: B열=신용카드, C열=체크카드/현금 (열별 그룹)
      const creditCards = paymentMethods
        .filter((pm) => pm.type === 'credit')
        .map((pm) => [pm.name] as (string | number | null)[]);
      const debitAndCash = paymentMethods
        .filter((pm) => pm.type !== 'credit')
        .map((pm) => [pm.name] as (string | number | null)[]);

      await this.clearRange(CELL_RANGES.CATEGORIES);
      if (categoryMatrix.length > 0) {
        await this.writeRange(CELL_RANGES.CATEGORIES, categoryMatrix);
      }

      await this.clearRange(CELL_RANGES.PAYMENT_CREDIT);
      if (creditCards.length > 0) {
        await this.writeRange(CELL_RANGES.PAYMENT_CREDIT, creditCards);
      }

      await this.clearRange(CELL_RANGES.PAYMENT_DEBIT);
      if (debitAndCash.length > 0) {
        await this.writeRange(CELL_RANGES.PAYMENT_DEBIT, debitAndCash);
      }

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
      // 설정 먼저 가져오기
      await this.importSettings();

      // 전체 12개월 거래 가져오기
      const now = new Date();
      const year = now.getFullYear();
      let totalImported = 0;

      for (let month = 1; month <= 12; month++) {
        const result = await this.importTransactions(year, month);
        if (result.details?.transactions) {
          totalImported += result.details.transactions;
        }
      }

      await this.updateLastSyncTime();

      return this.createSyncResult('success', `전체 가져오기 완료 (${totalImported}건)`, {
        transactions: totalImported,
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

      // 지출 데이터 읽기
      const expenseRange = CELL_RANGES.EXPENSE_TRANSACTIONS(monthName);
      const expenseRows = await this.readRange(expenseRange);

      // 수입 데이터 읽기
      const incomeRange = CELL_RANGES.INCOME_DETAILS(monthName);
      const incomeRows = await this.readRange(incomeRange);

      // 기존 해당 월 거래 삭제
      const existingTransactions = this.deps.transactionService.getAll().filter((t) => {
        const d = t.date;
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      });
      for (const t of existingTransactions) {
        this.deps.transactionService.delete(t.id);
      }

      let importedCount = 0;

      // 지출 행 → Transaction 변환 및 생성
      for (const row of expenseRows) {
        if (!row || row.length === 0 || !row[0]) continue;

        const transaction = await this.expenseRowToTransaction(
          row,
          year,
          month
        );
        if (transaction) {
          this.deps.transactionService.create(transaction);
          importedCount++;
        }
      }

      // 수입 행 → Transaction 변환 및 생성
      for (const row of incomeRows) {
        if (!row || row.length === 0 || !row[0]) continue;

        const transaction = await this.incomeRowToTransaction(
          row,
          year,
          month
        );
        if (transaction) {
          this.deps.transactionService.create(transaction);
          importedCount++;
        }
      }

      await this.updateLastSyncTime();

      return this.createSyncResult(
        'success',
        `${year}년 ${month}월 거래 가져오기 완료`,
        { transactions: importedCount }
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
      // 카테고리 매트릭스 읽기
      const categoryRows = await this.readRange(CELL_RANGES.CATEGORIES);

      let categoriesImported = 0;
      let subCategoriesImported = 0;

      for (const row of categoryRows) {
        if (!row || row.length === 0 || !row[0]) continue;

        const categoryName = String(row[0]);

        // 대분류 찾기 또는 생성
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

        // 소분류 파싱 (row[1], row[2], ...)
        for (let i = 1; i < row.length; i++) {
          const cellValue = row[i];
          if (!cellValue) continue;

          const subName = String(cellValue);
          const parsed = this.parseSubCategoryName(subName);

          // 기존 소분류 확인
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

      // 결제수단 읽기: B열=신용, C열=체크/현금 (열별 그룹)
      let paymentMethodsImported = 0;

      const creditRows = await this.readRange(CELL_RANGES.PAYMENT_CREDIT);
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

      const debitRows = await this.readRange(CELL_RANGES.PAYMENT_DEBIT);
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

      await this.updateLastSyncTime();

      return this.createSyncResult('success', '설정 가져오기 완료', {
        categories: categoriesImported,
        subCategories: subCategoriesImported,
        paymentMethods: paymentMethodsImported,
      });
    } catch (error) {
      return this.createSyncResult(
        'error',
        `설정 가져오기 실패: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // ========== Private: API Methods ==========

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
