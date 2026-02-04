import {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  TransactionType,
} from '../types';
import { ICategoryService } from './interfaces/ICategoryService';

/**
 * 카테고리 서비스 구현체
 * 메모리 캐시 기반으로 카테고리 CRUD 기능 제공
 */
export class CategoryService implements ICategoryService {
  private categories: Map<string, Category> = new Map();
  private idCounter: number = 0;

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
    return updated;
  }

  delete(id: string): boolean {
    return this.categories.delete(id);
  }

  clear(): void {
    this.categories.clear();
    this.idCounter = 0;
  }
}
