import {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  TransactionType,
} from '../types';
import { ICategoryService } from './interfaces/ICategoryService';
import { IStorageService } from './interfaces/IStorageService';

/**
 * 카테고리 서비스 구현체
 * 메모리 캐시 기반으로 카테고리 CRUD 기능 제공
 */
export class CategoryService implements ICategoryService {
  private categories: Map<string, Category> = new Map();
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

    const items = await storageService.load<Category>(storageKey);
    for (const item of items) {
      this.categories.set(item.id, item);
    }

    const counter = await storageService.loadValue<number>(idCounterKey);
    if (counter !== null) {
      this.idCounter = counter;
    }
  }

  private persist(): void {
    if (!this.storageService) return;
    const items = Array.from(this.categories.values());
    this.storageService.save(this.storageKey, items);
    this.storageService.saveValue(this.idCounterKey, this.idCounter);
  }

  private generateId(): string {
    this.idCounter += 1;
    return `category-${this.idCounter}-${Date.now()}`;
  }

  create(input: CreateCategoryInput): Category {
    const category: Category = {
      id: this.generateId(),
      name: input.name,
      type: input.type,
      icon: input.icon,
      color: input.color,
    };

    this.categories.set(category.id, category);
    this.persist();
    return category;
  }

  getById(id: string): Category | undefined {
    return this.categories.get(id);
  }

  getAll(): Category[] {
    return Array.from(this.categories.values());
  }

  getByType(type: TransactionType): Category[] {
    return this.getAll().filter((category) => category.type === type);
  }

  update(id: string, input: UpdateCategoryInput): Category | undefined {
    const existing = this.categories.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: Category = {
      ...existing,
      ...input,
      id: existing.id,
    };

    this.categories.set(id, updated);
    this.persist();
    return updated;
  }

  delete(id: string): boolean {
    const result = this.categories.delete(id);
    if (result) this.persist();
    return result;
  }

  clear(): void {
    this.categories.clear();
    this.idCounter = 0;
    this.persist();
  }
}
