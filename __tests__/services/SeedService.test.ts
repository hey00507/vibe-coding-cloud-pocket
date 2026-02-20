import { SeedService } from '../../src/services/SeedService';
import { CategoryService } from '../../src/services/CategoryService';
import { SubCategoryService } from '../../src/services/SubCategoryService';
import { PaymentMethodService } from '../../src/services/PaymentMethodService';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_PAYMENT_METHODS,
} from '../../src/constants/defaultCategories';

describe('SeedService', () => {
  let seedService: SeedService;
  let categoryService: CategoryService;
  let subCategoryService: SubCategoryService;
  let paymentMethodService: PaymentMethodService;

  beforeEach(() => {
    seedService = new SeedService();
    categoryService = new CategoryService();
    subCategoryService = new SubCategoryService();
    paymentMethodService = new PaymentMethodService();
  });

  describe('isSeeded', () => {
    it('should return false initially', () => {
      expect(seedService.isSeeded()).toBe(false);
    });

    it('should return true after seeding', () => {
      seedService.seedAll(categoryService, subCategoryService, paymentMethodService);
      expect(seedService.isSeeded()).toBe(true);
    });
  });

  describe('markSeeded', () => {
    it('should mark as seeded', () => {
      seedService.markSeeded();
      expect(seedService.isSeeded()).toBe(true);
    });
  });

  describe('resetSeeded', () => {
    it('should reset seeded state', () => {
      seedService.markSeeded();
      seedService.resetSeeded();
      expect(seedService.isSeeded()).toBe(false);
    });
  });

  describe('seedAll', () => {
    it('should create all expense categories', () => {
      seedService.seedAll(categoryService, subCategoryService, paymentMethodService);

      const expenseCategories = categoryService.getByType('expense');
      expect(expenseCategories).toHaveLength(DEFAULT_EXPENSE_CATEGORIES.length);
    });

    it('should create all income categories', () => {
      seedService.seedAll(categoryService, subCategoryService, paymentMethodService);

      const incomeCategories = categoryService.getByType('income');
      expect(incomeCategories).toHaveLength(DEFAULT_INCOME_CATEGORIES.length);
    });

    it('should create sub-categories for each expense category', () => {
      seedService.seedAll(categoryService, subCategoryService, paymentMethodService);

      const expenseCategories = categoryService.getByType('expense');
      for (let i = 0; i < expenseCategories.length; i++) {
        const subs = subCategoryService.getByCategoryId(expenseCategories[i].id);
        expect(subs.length).toBe(DEFAULT_EXPENSE_CATEGORIES[i].subCategories.length);
      }
    });

    it('should create all payment methods', () => {
      seedService.seedAll(categoryService, subCategoryService, paymentMethodService);

      const methods = paymentMethodService.getAll();
      expect(methods).toHaveLength(DEFAULT_PAYMENT_METHODS.length);
    });

    it('should create payment methods with correct types', () => {
      seedService.seedAll(categoryService, subCategoryService, paymentMethodService);

      const methods = paymentMethodService.getAll();
      expect(methods[0].type).toBe('credit');
      expect(methods[1].type).toBe('debit');
      expect(methods[2].type).toBe('cash');
    });

    it('should not seed again when already seeded', () => {
      seedService.seedAll(categoryService, subCategoryService, paymentMethodService);
      const firstCount = categoryService.getAll().length;

      seedService.seedAll(categoryService, subCategoryService, paymentMethodService);
      const secondCount = categoryService.getAll().length;

      expect(secondCount).toBe(firstCount);
    });

    it('should create correct total number of sub-categories', () => {
      seedService.seedAll(categoryService, subCategoryService, paymentMethodService);

      const totalExpectedSubs = DEFAULT_EXPENSE_CATEGORIES.reduce(
        (sum, cat) => sum + cat.subCategories.length,
        0
      );
      const allSubs = subCategoryService.getAll();
      expect(allSubs).toHaveLength(totalExpectedSubs);
    });

    it('should create categories with icons', () => {
      seedService.seedAll(categoryService, subCategoryService, paymentMethodService);

      const allCategories = categoryService.getAll();
      allCategories.forEach((cat) => {
        expect(cat.icon).toBeTruthy();
      });
    });
  });
});
