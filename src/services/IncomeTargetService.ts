import {
  IncomeTarget,
  CreateIncomeTargetInput,
  UpdateIncomeTargetInput,
} from '../types';
import { IIncomeTargetService } from './interfaces/IIncomeTargetService';
import { IStorageService } from './interfaces/IStorageService';

export class IncomeTargetService implements IIncomeTargetService {
  private targets: Map<string, IncomeTarget> = new Map();
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

    const items = await storageService.load<IncomeTarget>(storageKey);
    for (const item of items) {
      this.targets.set(item.id, item);
    }

    const counter = await storageService.loadValue<number>(idCounterKey);
    if (counter !== null) {
      this.idCounter = counter;
    }
  }

  private persist(): void {
    if (!this.storageService) return;
    const items = Array.from(this.targets.values());
    this.storageService.save(this.storageKey, items);
    this.storageService.saveValue(this.idCounterKey, this.idCounter);
  }

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
    this.persist();
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
    this.persist();
    return updated;
  }

  delete(id: string): boolean {
    const result = this.targets.delete(id);
    if (result) this.persist();
    return result;
  }

  clear(): void {
    this.targets.clear();
    this.idCounter = 0;
    this.persist();
  }
}
