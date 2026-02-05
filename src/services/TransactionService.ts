import {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionType,
  DailySummary,
} from '../types';
import { ITransactionService } from './interfaces/ITransactionService';

/**
 * 거래 서비스 구현체
 * 메모리 캐시 기반으로 거래 CRUD 및 조회 기능 제공
 */
export class TransactionService implements ITransactionService {
  private transactions: Map<string, Transaction> = new Map();
  private idCounter: number = 0;

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
      paymentMethodId: input.paymentMethodId,
      memo: input.memo,
    };

    this.transactions.set(transaction.id, transaction);
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
    return updated;
  }

  delete(id: string): boolean {
    return this.transactions.delete(id);
  }

  clear(): void {
    this.transactions.clear();
    this.idCounter = 0;
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

  private formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
