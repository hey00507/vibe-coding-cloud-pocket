import {
  Budget,
  CreateBudgetInput,
  UpdateBudgetInput,
  BudgetProgress,
  BudgetStatus,
} from '../types';
import { IBudgetService } from './interfaces/IBudgetService';
import { IStorageService } from './interfaces/IStorageService';

export class BudgetService implements IBudgetService {
  private budgets: Map<string, Budget> = new Map();
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

    const items = await storageService.load<Budget>(storageKey);
    for (const item of items) {
      this.budgets.set(item.id, item);
    }

    const counter = await storageService.loadValue<number>(idCounterKey);
    if (counter !== null) {
      this.idCounter = counter;
    }
  }

  private persist(): void {
    if (!this.storageService) return;
    const items = Array.from(this.budgets.values());
    this.storageService.save(this.storageKey, items);
    this.storageService.saveValue(this.idCounterKey, this.idCounter);
  }

  private generateId(): string {
    this.idCounter += 1;
    return `budget-${this.idCounter}-${Date.now()}`;
  }

  private getStatus(percentage: number): BudgetStatus {
    if (percentage >= 80) return 'over';
    if (percentage >= 50) return 'warning';
    return 'safe';
  }

  create(input: CreateBudgetInput): Budget {
    const budget: Budget = {
      id: this.generateId(),
      categoryId: input.categoryId,
      monthlyAmount: input.monthlyAmount,
      year: input.year,
      month: input.month,
    };

    this.budgets.set(budget.id, budget);
    this.persist();
    return budget;
  }

  getById(id: string): Budget | undefined {
    return this.budgets.get(id);
  }

  getAll(): Budget[] {
    return Array.from(this.budgets.values());
  }

  getByMonth(year: number, month: number): Budget[] {
    return this.getAll().filter(
      (b) => b.year === year && b.month === month
    );
  }

  getByCategoryAndMonth(
    categoryId: string,
    year: number,
    month: number
  ): Budget | undefined {
    return this.getAll().find(
      (b) => b.categoryId === categoryId && b.year === year && b.month === month
    );
  }

  update(id: string, input: UpdateBudgetInput): Budget | undefined {
    const existing = this.budgets.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: Budget = {
      ...existing,
      ...input,
      id: existing.id,
    };

    this.budgets.set(id, updated);
    this.persist();
    return updated;
  }

  delete(id: string): boolean {
    const result = this.budgets.delete(id);
    if (result) this.persist();
    return result;
  }

  clear(): void {
    this.budgets.clear();
    this.idCounter = 0;
    this.persist();
  }

  getProgress(
    year: number,
    month: number,
    expenses: Map<string, number>,
    categoryNames: Map<string, string>
  ): BudgetProgress[] {
    const monthBudgets = this.getByMonth(year, month);
    if (monthBudgets.length === 0) return [];

    return monthBudgets
      .map((b) => {
        const spent = expenses.get(b.categoryId) ?? 0;
        const percentage = b.monthlyAmount > 0
          ? Math.round((spent / b.monthlyAmount) * 100)
          : 0;

        return {
          categoryId: b.categoryId,
          categoryName: categoryNames.get(b.categoryId) ?? '',
          budget: b.monthlyAmount,
          spent,
          remaining: b.monthlyAmount - spent,
          percentage,
          status: this.getStatus(percentage),
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }

  getTotalProgress(
    year: number,
    month: number,
    totalExpense: number
  ): { budget: number; spent: number; remaining: number; percentage: number; status: BudgetStatus } {
    const monthBudgets = this.getByMonth(year, month);
    const totalBudget = monthBudgets.reduce((sum, b) => sum + b.monthlyAmount, 0);

    if (totalBudget === 0) {
      return { budget: 0, spent: totalExpense, remaining: 0, percentage: 0, status: 'safe' };
    }

    const percentage = Math.round((totalExpense / totalBudget) * 100);

    return {
      budget: totalBudget,
      spent: totalExpense,
      remaining: totalBudget - totalExpense,
      percentage,
      status: this.getStatus(percentage),
    };
  }

  copyFromPreviousMonth(year: number, month: number): number {
    // 이미 현재 월에 예산이 있으면 복사하지 않음
    if (this.getByMonth(year, month).length > 0) {
      return 0;
    }

    // 이전 월 계산 (1월 → 전년 12월)
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    const prevBudgets = this.getByMonth(prevYear, prevMonth);
    if (prevBudgets.length === 0) return 0;

    for (const prev of prevBudgets) {
      this.create({
        categoryId: prev.categoryId,
        monthlyAmount: prev.monthlyAmount,
        year,
        month,
      });
    }

    return prevBudgets.length;
  }
}
