import {
  SavingsProduct,
  CreateSavingsProductInput,
  UpdateSavingsProductInput,
  SavingsProductStatus,
} from '../types';
import { ISavingsService } from './interfaces/ISavingsService';

export class SavingsService implements ISavingsService {
  private products: Map<string, SavingsProduct> = new Map();
  private idCounter: number = 0;

  private generateId(): string {
    this.idCounter += 1;
    return `savings-${this.idCounter}-${Date.now()}`;
  }

  create(input: CreateSavingsProductInput): SavingsProduct {
    const product: SavingsProduct = {
      id: this.generateId(),
      name: input.name,
      status: input.status,
      interestRate: input.interestRate,
      bank: input.bank,
      startDate: input.startDate,
      endDate: input.endDate,
      monthlyAmount: input.monthlyAmount,
      paidMonths: input.paidMonths,
      currentAmount: input.currentAmount,
      memo: input.memo,
    };

    this.products.set(product.id, product);
    return product;
  }

  getById(id: string): SavingsProduct | undefined {
    return this.products.get(id);
  }

  getAll(): SavingsProduct[] {
    return Array.from(this.products.values());
  }

  getByStatus(status: SavingsProductStatus): SavingsProduct[] {
    return this.getAll().filter((p) => p.status === status);
  }

  getTotalCurrentAmount(): number {
    return this.getAll().reduce((sum, p) => sum + p.currentAmount, 0);
  }

  getMonthlySavingsTotal(): number {
    return this.getByStatus('active').reduce((sum, p) => sum + p.monthlyAmount, 0);
  }

  update(id: string, input: UpdateSavingsProductInput): SavingsProduct | undefined {
    const existing = this.products.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: SavingsProduct = {
      ...existing,
      ...input,
      id: existing.id,
    };

    this.products.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.products.delete(id);
  }

  clear(): void {
    this.products.clear();
    this.idCounter = 0;
  }
}
