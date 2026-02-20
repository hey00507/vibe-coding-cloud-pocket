import {
  IncomeTarget,
  CreateIncomeTargetInput,
  UpdateIncomeTargetInput,
} from '../types';
import { IIncomeTargetService } from './interfaces/IIncomeTargetService';

export class IncomeTargetService implements IIncomeTargetService {
  private targets: Map<string, IncomeTarget> = new Map();
  private idCounter: number = 0;

  private generateId(): string {
    this.idCounter += 1;
    return `income-target-${this.idCounter}-${Date.now()}`;
  }

  create(input: CreateIncomeTargetInput): IncomeTarget {
    const target: IncomeTarget = {
      id: this.generateId(),
      categoryId: input.categoryId,
      year: input.year,
      month: input.month,
      targetAmount: input.targetAmount,
    };

    this.targets.set(target.id, target);
    return target;
  }

  getById(id: string): IncomeTarget | undefined {
    return this.targets.get(id);
  }

  getAll(): IncomeTarget[] {
    return Array.from(this.targets.values());
  }

  getByMonth(year: number, month: number): IncomeTarget[] {
    return this.getAll().filter(
      (t) => t.year === year && t.month === month
    );
  }

  update(id: string, input: UpdateIncomeTargetInput): IncomeTarget | undefined {
    const existing = this.targets.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: IncomeTarget = {
      ...existing,
      ...input,
      id: existing.id,
    };

    this.targets.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.targets.delete(id);
  }

  clear(): void {
    this.targets.clear();
    this.idCounter = 0;
  }
}
