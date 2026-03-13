import {
  SavingsProduct,
  CreateSavingsProductInput,
  UpdateSavingsProductInput,
  SavingsProductStatus,
} from '../types';
import { ISavingsService } from './interfaces/ISavingsService';
import { IStorageService } from './interfaces/IStorageService';

export class SavingsService implements ISavingsService {
  private products: Map<string, SavingsProduct> = new Map();
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

    const items = await storageService.load<SavingsProduct>(storageKey, [
      'startDate',
      'endDate',
    ]);
    for (const item of items) {
      this.products.set(item.id, item);
    }

    const counter = await storageService.loadValue<number>(idCounterKey);
    if (counter !== null) {
      this.idCounter = counter;
    }
  }

  private persist(): void {
    if (!this.storageService) return;
    const items = Array.from(this.products.values());
    this.storageService.save(this.storageKey, items);
    this.storageService.saveValue(this.idCounterKey, this.idCounter);
  }

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
    this.persist();
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
    this.persist();
    return updated;
  }

  delete(id: string): boolean {
    const result = this.products.delete(id);
    if (result) this.persist();
    return result;
  }

  clear(): void {
    this.products.clear();
    this.idCounter = 0;
    this.persist();
  }
}
