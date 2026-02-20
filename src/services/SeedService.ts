import { ICategoryService } from './interfaces/ICategoryService';
import { ISubCategoryService } from './interfaces/ISubCategoryService';
import { IPaymentMethodService } from './interfaces/IPaymentMethodService';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_PAYMENT_METHODS,
} from '../constants/defaultCategories';

/**
 * 초기 데이터 시드 서비스
 * 앱 첫 실행 시 기본 카테고리/소분류/결제수단 자동 세팅
 */
export class SeedService {
  private seeded: boolean = false;

  isSeeded(): boolean {
    return this.seeded;
  }

  markSeeded(): void {
    this.seeded = true;
  }

  resetSeeded(): void {
    this.seeded = false;
  }

  seedAll(
    categoryService: ICategoryService,
    subCategoryService: ISubCategoryService,
    paymentMethodService: IPaymentMethodService
  ): void {
    if (this.seeded) return;

    // 지출 카테고리 + 소분류
    for (const catDef of DEFAULT_EXPENSE_CATEGORIES) {
      const category = categoryService.create({
        name: catDef.name,
        type: catDef.type,
        icon: catDef.icon,
      });

      for (const subDef of catDef.subCategories) {
        subCategoryService.create({
          categoryId: category.id,
          name: subDef.name,
          icon: subDef.icon,
        });
      }
    }

    // 수입 카테고리
    for (const catDef of DEFAULT_INCOME_CATEGORIES) {
      categoryService.create({
        name: catDef.name,
        type: catDef.type,
        icon: catDef.icon,
      });
    }

    // 결제수단
    for (const pmDef of DEFAULT_PAYMENT_METHODS) {
      paymentMethodService.create({
        name: pmDef.name,
        icon: pmDef.icon,
        type: pmDef.type,
      });
    }

    this.seeded = true;
  }
}
