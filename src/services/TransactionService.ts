import {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionType,
  DailySummary,
  PeriodSummary,
  CategoryBreakdown,
  PaymentMethodBreakdown,
  MonthlyCategoryMatrix,
  EnhancedMonthlySummary,
} from '../types';
import { ITransactionService } from './interfaces/ITransactionService';
import { IStorageService } from './interfaces/IStorageService';

/**
 * 거래 서비스 구현체
 * 메모리 캐시 기반으로 거래 CRUD 및 조회 기능 제공
 */
export class TransactionService implements ITransactionService {
  private transactions: Map<string, Transaction> = new Map();
  private idCounter: number = 0;
  private storageService: IStorageService | null = null;
  private storageKey: string = '';
  private idCounterKey: string = '';

  async hydrate(
    storageService: IStorageService,
    storageKey: string,
    idCounterKey: string
  ): Promise<void> {
    this.storageService = storageService;
    this.storageKey = storageKey;
    this.idCounterKey = idCounterKey;

    const items = await storageService.load<Transaction>(storageKey, ['date']);
    for (const item of items) {
      this.transactions.set(item.id, item);
    }

    const counter = await storageService.loadValue<number>(idCounterKey);
    if (counter !== null) {
      this.idCounter = counter;
    }
  }

  private persist(): void {
    if (!this.storageService) return;
    const items = Array.from(this.transactions.values());
    this.storageService.save(this.storageKey, items);
    this.storageService.saveValue(this.idCounterKey, this.idCounter);
  }

  private generateId(): string {
    this.idCounter += 1;
    return `transaction-${this.idCounter}-${Date.now()}`;
  }

  create(input: CreateTransactionInput): Transaction {
    const transaction: Transaction = {
      id: this.generateId(),
      type: input.type,
      amount: input.amount,
      date: input.date,
      categoryId: input.categoryId,
      subCategoryId: input.subCategoryId,
      paymentMethodId: input.paymentMethodId,
      memo: input.memo,
    };

    this.transactions.set(transaction.id, transaction);
    this.persist();
    return transaction;
  }

  getById(id: string): Transaction | undefined {
    return this.transactions.get(id);
  }

  getAll(): Transaction[] {
    return Array.from(this.transactions.values());
  }

  getByType(type: TransactionType): Transaction[] {
    return this.getAll().filter((transaction) => transaction.type === type);
  }

  getByDateRange(startDate: Date, endDate: Date): Transaction[] {
    return this.getAll().filter((transaction) => {
      const transactionDate = transaction.date;
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }

  getByCategoryId(categoryId: string): Transaction[] {
    return this.getAll().filter(
      (transaction) => transaction.categoryId === categoryId
    );
  }

  getByPaymentMethodId(paymentMethodId: string): Transaction[] {
    return this.getAll().filter(
      (transaction) => transaction.paymentMethodId === paymentMethodId
    );
  }

  update(id: string, input: UpdateTransactionInput): Transaction | undefined {
    const existing = this.transactions.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: Transaction = {
      ...existing,
      ...input,
      id: existing.id,
    };

    this.transactions.set(id, updated);
    this.persist();
    return updated;
  }

  delete(id: string): boolean {
    const result = this.transactions.delete(id);
    if (result) this.persist();
    return result;
  }

  clear(): void {
    this.transactions.clear();
    this.idCounter = 0;
    this.persist();
  }

  getTotalIncome(): number {
    return this.getByType('income').reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );
  }

  getTotalExpense(): number {
    return this.getByType('expense').reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );
  }

  getBalance(): number {
    return this.getTotalIncome() - this.getTotalExpense();
  }

  getByDate(date: Date): Transaction[] {
    const targetDate = this.formatDateToString(date);
    return this.getAll().filter((transaction) => {
      const transactionDate = this.formatDateToString(transaction.date);
      return transactionDate === targetDate;
    });
  }

  getDailySummaries(year: number, month: number): DailySummary[] {
    // 해당 월의 거래만 필터링
    const monthTransactions = this.getAll().filter((transaction) => {
      const d = transaction.date;
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });

    // 날짜별로 그룹화
    const dailyMap = new Map<string, Transaction[]>();
    monthTransactions.forEach((transaction) => {
      const dateKey = this.formatDateToString(transaction.date);
      const existing = dailyMap.get(dateKey) || [];
      dailyMap.set(dateKey, [...existing, transaction]);
    });

    // DailySummary 배열 생성
    const summaries: DailySummary[] = [];
    dailyMap.forEach((transactions, date) => {
      const totalIncome = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      summaries.push({
        date,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        transactionCount: transactions.length,
      });
    });

    // 날짜순 정렬
    return summaries.sort((a, b) => a.date.localeCompare(b.date));
  }

  getMonthlySummary(year: number, month: number): PeriodSummary {
    const transactions = this.getAll().filter((t) => {
      const d = t.date;
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });

    return this.buildPeriodSummary(transactions);
  }

  getYearlySummary(year: number): PeriodSummary {
    const transactions = this.getAll().filter(
      (t) => t.date.getFullYear() === year
    );

    return this.buildPeriodSummary(transactions);
  }

  getCategoryBreakdown(
    startDate: Date,
    endDate: Date,
    type?: TransactionType
  ): CategoryBreakdown[] {
    let transactions = this.getByDateRange(startDate, endDate);
    if (type) {
      transactions = transactions.filter((t) => t.type === type);
    }

    if (transactions.length === 0) return [];

    const map = new Map<
      string,
      { amount: number; transactionCount: number }
    >();
    transactions.forEach((t) => {
      const existing = map.get(t.categoryId) || {
        amount: 0,
        transactionCount: 0,
      };
      map.set(t.categoryId, {
        amount: existing.amount + t.amount,
        transactionCount: existing.transactionCount + 1,
      });
    });

    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    const result: CategoryBreakdown[] = [];
    map.forEach((value, categoryId) => {
      result.push({
        categoryId,
        amount: value.amount,
        percentage: Math.round((value.amount / totalAmount) * 100),
        transactionCount: value.transactionCount,
      });
    });

    return result.sort((a, b) => b.amount - a.amount);
  }

  getPaymentMethodBreakdown(
    startDate: Date,
    endDate: Date,
    type?: TransactionType
  ): PaymentMethodBreakdown[] {
    let transactions = this.getByDateRange(startDate, endDate);
    if (type) {
      transactions = transactions.filter((t) => t.type === type);
    }

    if (transactions.length === 0) return [];

    const map = new Map<
      string,
      { amount: number; transactionCount: number }
    >();
    transactions.forEach((t) => {
      const existing = map.get(t.paymentMethodId) || {
        amount: 0,
        transactionCount: 0,
      };
      map.set(t.paymentMethodId, {
        amount: existing.amount + t.amount,
        transactionCount: existing.transactionCount + 1,
      });
    });

    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    const result: PaymentMethodBreakdown[] = [];
    map.forEach((value, paymentMethodId) => {
      result.push({
        paymentMethodId,
        amount: value.amount,
        percentage: Math.round((value.amount / totalAmount) * 100),
        transactionCount: value.transactionCount,
      });
    });

    return result.sort((a, b) => b.amount - a.amount);
  }

  private buildPeriodSummary(transactions: Transaction[]): PeriodSummary {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: transactions.length,
    };
  }

  getAnnualCategoryMatrix(
    year: number,
    categoryMap: Map<string, string>
  ): MonthlyCategoryMatrix[] {
    // 연도 내 지출 거래만 필터링
    const yearExpenses = this.getAll().filter(
      (t) => t.date.getFullYear() === year && t.type === 'expense'
    );

    // 카테고리별 월별 금액 집계
    const matrixMap = new Map<string, number[]>();

    yearExpenses.forEach((t) => {
      const monthIndex = t.date.getMonth(); // 0-11
      if (!matrixMap.has(t.categoryId)) {
        matrixMap.set(t.categoryId, new Array(12).fill(0));
      }
      const amounts = matrixMap.get(t.categoryId)!;
      amounts[monthIndex] += t.amount;
    });

    const result: MonthlyCategoryMatrix[] = [];
    matrixMap.forEach((monthlyAmounts, categoryId) => {
      const total = monthlyAmounts.reduce((sum, a) => sum + a, 0);
      result.push({
        categoryId,
        categoryName: categoryMap.get(categoryId) ?? '미분류',
        monthlyAmounts,
        total,
      });
    });

    // 총 금액 내림차순 정렬
    return result.sort((a, b) => b.total - a.total);
  }

  getEnhancedMonthlySummary(
    year: number,
    month: number,
    totalSavings: number
  ): EnhancedMonthlySummary {
    const base = this.getMonthlySummary(year, month);
    const remainingCash = base.totalIncome - base.totalExpense - totalSavings;
    const savingsRate = base.totalIncome > 0
      ? Math.round((totalSavings / base.totalIncome) * 100)
      : 0;
    // 급여 대비 저축률 = 저축액 / 수입 (동일 기준, 수입을 급여로 간주)
    const salarySavingsRate = savingsRate;

    return {
      ...base,
      totalSavings,
      savingsRate,
      remainingCash,
      salarySavingsRate,
    };
  }

  private formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
