import {
  SubCategory,
  CreateSubCategoryInput,
  UpdateSubCategoryInput,
} from '../types';
import { ISubCategoryService } from './interfaces/ISubCategoryService';

/**
 * 소분류 카테고리 서비스 구현체
 * 메모리 캐시 기반으로 소분류 CRUD 기능 제공
 */
export class SubCategoryService implements ISubCategoryService {
  private subCategories: Map<string, SubCategory> = new Map();
  private idCounter: number = 0;

  private generateId(): string {
    this.idCounter += 1;
    return `sub-category-${this.idCounter}-${Date.now()}`;
  }

  create(input: CreateSubCategoryInput): SubCategory {
    const subCategory: SubCategory = {
      id: this.generateId(),
      categoryId: input.categoryId,
      name: input.name,
      icon: input.icon,
    };

    this.subCategories.set(subCategory.id, subCategory);
    return subCategory;
  }

  getById(id: string): SubCategory | undefined {
    return this.subCategories.get(id);
  }

  getAll(): SubCategory[] {
    return Array.from(this.subCategories.values());
  }

  getByCategoryId(categoryId: string): SubCategory[] {
    return this.getAll().filter((sc) => sc.categoryId === categoryId);
  }

  update(id: string, input: UpdateSubCategoryInput): SubCategory | undefined {
    const existing = this.subCategories.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: SubCategory = {
      ...existing,
      ...input,
      id: existing.id,
    };

    this.subCategories.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.subCategories.delete(id);
  }

  clear(): void {
    this.subCategories.clear();
    this.idCounter = 0;
  }
}
