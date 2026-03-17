import { BudgetService } from '../../src/services/BudgetService';

describe('BudgetService', () => {
  let service: BudgetService;

  beforeEach(() => {
    service = new BudgetService();
  });

  describe('create', () => {
    it('should create a budget with generated id', () => {
      const budget = service.create({
        categoryId: 'cat-1',
        monthlyAmount: 300000,
        year: 2026,
        month: 3,
      });

      expect(budget.id).toContain('budget-');
      expect(budget.categoryId).toBe('cat-1');
      expect(budget.monthlyAmount).toBe(300000);
      expect(budget.year).toBe(2026);
      expect(budget.month).toBe(3);
    });

    it('should generate unique ids', () => {
      const b1 = service.create({
        categoryId: 'cat-1',
        monthlyAmount: 100000,
        year: 2026,
        month: 3,
      });
      const b2 = service.create({
        categoryId: 'cat-2',
        monthlyAmount: 200000,
        year: 2026,
        month: 3,
      });

      expect(b1.id).not.toBe(b2.id);
    });
  });

  describe('getById', () => {
    it('should return budget by id', () => {
      const created = service.create({
        categoryId: 'cat-1',
        monthlyAmount: 300000,
        year: 2026,
        month: 3,
      });

      expect(service.getById(created.id)).toEqual(created);
    });

    it('should return undefined for nonexistent id', () => {
      expect(service.getById('nonexistent')).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return empty array initially', () => {
      expect(service.getAll()).toEqual([]);
    });

    it('should return all budgets', () => {
      service.create({ categoryId: 'cat-1', monthlyAmount: 100000, year: 2026, month: 3 });
      service.create({ categoryId: 'cat-2', monthlyAmount: 200000, year: 2026, month: 3 });

      expect(service.getAll()).toHaveLength(2);
    });
  });

  describe('getByMonth', () => {
    it('should return budgets for specific month', () => {
      service.create({ categoryId: 'cat-1', monthlyAmount: 100000, year: 2026, month: 3 });
      service.create({ categoryId: 'cat-2', monthlyAmount: 200000, year: 2026, month: 3 });
      service.create({ categoryId: 'cat-1', monthlyAmount: 100000, year: 2026, month: 4 });

      const march = service.getByMonth(2026, 3);
      expect(march).toHaveLength(2);

      const april = service.getByMonth(2026, 4);
      expect(april).toHaveLength(1);
    });

    it('should return empty for month with no budgets', () => {
      expect(service.getByMonth(2026, 12)).toEqual([]);
    });
  });

  describe('getByCategoryAndMonth', () => {
    it('should return budget for specific category and month', () => {
      service.create({ categoryId: 'cat-1', monthlyAmount: 300000, year: 2026, month: 3 });
      service.create({ categoryId: 'cat-2', monthlyAmount: 200000, year: 2026, month: 3 });

      const result = service.getByCategoryAndMonth('cat-1', 2026, 3);
      expect(result?.categoryId).toBe('cat-1');
      expect(result?.monthlyAmount).toBe(300000);
    });

    it('should return undefined if not found', () => {
      expect(service.getByCategoryAndMonth('cat-1', 2026, 3)).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update budget amount', () => {
      const created = service.create({
        categoryId: 'cat-1',
        monthlyAmount: 300000,
        year: 2026,
        month: 3,
      });

      const updated = service.update(created.id, { monthlyAmount: 500000 });
      expect(updated?.monthlyAmount).toBe(500000);
      expect(updated?.categoryId).toBe('cat-1');
    });

    it('should not change id on update', () => {
      const created = service.create({
        categoryId: 'cat-1',
        monthlyAmount: 300000,
        year: 2026,
        month: 3,
      });

      const updated = service.update(created.id, { monthlyAmount: 500000 });
      expect(updated?.id).toBe(created.id);
    });

    it('should return undefined for nonexistent id', () => {
      expect(service.update('nonexistent', { monthlyAmount: 100000 })).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete budget', () => {
      const created = service.create({
        categoryId: 'cat-1',
        monthlyAmount: 300000,
        year: 2026,
        month: 3,
      });

      expect(service.delete(created.id)).toBe(true);
      expect(service.getById(created.id)).toBeUndefined();
    });

    it('should return false for nonexistent id', () => {
      expect(service.delete('nonexistent')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all budgets', () => {
      service.create({ categoryId: 'cat-1', monthlyAmount: 100000, year: 2026, month: 3 });
      service.create({ categoryId: 'cat-2', monthlyAmount: 200000, year: 2026, month: 3 });

      service.clear();
      expect(service.getAll()).toEqual([]);
    });
  });

  describe('getProgress', () => {
    beforeEach(() => {
      service.create({ categoryId: 'cat-1', monthlyAmount: 300000, year: 2026, month: 3 });
      service.create({ categoryId: 'cat-2', monthlyAmount: 200000, year: 2026, month: 3 });
      service.create({ categoryId: 'cat-3', monthlyAmount: 100000, year: 2026, month: 3 });
    });

    it('should calculate progress for each category', () => {
      const expenses = new Map([
        ['cat-1', 150000],
        ['cat-2', 180000],
        ['cat-3', 30000],
      ]);
      const names = new Map([
        ['cat-1', '식비'],
        ['cat-2', '교통비'],
        ['cat-3', '여가'],
      ]);

      const progress = service.getProgress(2026, 3, expenses, names);

      expect(progress).toHaveLength(3);
      // 소진률 높은 순 정렬
      expect(progress[0].categoryId).toBe('cat-2'); // 90%
      expect(progress[1].categoryId).toBe('cat-1'); // 50%
      expect(progress[2].categoryId).toBe('cat-3'); // 30%
    });

    it('should set status based on percentage', () => {
      const expenses = new Map([
        ['cat-1', 150000],  // 50% → safe
        ['cat-2', 180000],  // 90% → over
        ['cat-3', 55000],   // 55% → warning
      ]);
      const names = new Map([
        ['cat-1', '식비'],
        ['cat-2', '교통비'],
        ['cat-3', '여가'],
      ]);

      const progress = service.getProgress(2026, 3, expenses, names);
      const byId = new Map(progress.map((p) => [p.categoryId, p]));

      expect(byId.get('cat-1')?.status).toBe('warning');   // 50% (50~80% = warning)
      expect(byId.get('cat-3')?.status).toBe('warning');   // 55%
      expect(byId.get('cat-2')?.status).toBe('over');      // 90% (80%+ = over)
    });

    it('should handle category with no spending', () => {
      const expenses = new Map<string, number>();
      const names = new Map([['cat-1', '식비'], ['cat-2', '교통비'], ['cat-3', '여가']]);

      const progress = service.getProgress(2026, 3, expenses, names);

      expect(progress[0].spent).toBe(0);
      expect(progress[0].percentage).toBe(0);
      expect(progress[0].status).toBe('safe');
    });

    it('should handle spending over budget', () => {
      const expenses = new Map([['cat-3', 150000]]); // 150% of 100000
      const names = new Map([['cat-1', '식비'], ['cat-2', '교통비'], ['cat-3', '여가']]);

      const progress = service.getProgress(2026, 3, expenses, names);
      const over = progress.find((p) => p.categoryId === 'cat-3')!;

      expect(over.percentage).toBe(150);
      expect(over.remaining).toBe(-50000);
      expect(over.status).toBe('over');
    });

    it('should return empty for month with no budgets', () => {
      const expenses = new Map([['cat-1', 100000]]);
      const names = new Map([['cat-1', '식비']]);

      expect(service.getProgress(2026, 12, expenses, names)).toEqual([]);
    });

    it('should handle zero budget amount', () => {
      service.clear();
      service.create({ categoryId: 'cat-zero', monthlyAmount: 0, year: 2026, month: 3 });

      const expenses = new Map([['cat-zero', 50000]]);
      const names = new Map([['cat-zero', '테스트']]);

      const progress = service.getProgress(2026, 3, expenses, names);
      expect(progress[0].percentage).toBe(0);
      expect(progress[0].status).toBe('safe');
    });

    it('should handle missing category name', () => {
      service.clear();
      service.create({ categoryId: 'unknown-cat', monthlyAmount: 100000, year: 2026, month: 3 });

      const expenses = new Map<string, number>();
      const names = new Map<string, string>(); // 이름 없음

      const progress = service.getProgress(2026, 3, expenses, names);
      expect(progress[0].categoryName).toBe('');
    });
  });

  describe('getTotalProgress', () => {
    it('should calculate total budget progress', () => {
      service.create({ categoryId: 'cat-1', monthlyAmount: 300000, year: 2026, month: 3 });
      service.create({ categoryId: 'cat-2', monthlyAmount: 200000, year: 2026, month: 3 });

      const total = service.getTotalProgress(2026, 3, 350000);

      expect(total.budget).toBe(500000);
      expect(total.spent).toBe(350000);
      expect(total.remaining).toBe(150000);
      expect(total.percentage).toBe(70);
      expect(total.status).toBe('warning');
    });

    it('should return zero budget when no budgets set', () => {
      const total = service.getTotalProgress(2026, 3, 100000);

      expect(total.budget).toBe(0);
      expect(total.percentage).toBe(0);
      expect(total.status).toBe('safe');
    });
  });

  describe('copyFromPreviousMonth', () => {
    it('should copy budgets from previous month', () => {
      service.create({ categoryId: 'cat-1', monthlyAmount: 300000, year: 2026, month: 2 });
      service.create({ categoryId: 'cat-2', monthlyAmount: 200000, year: 2026, month: 2 });

      const copied = service.copyFromPreviousMonth(2026, 3);

      expect(copied).toBe(2);
      expect(service.getByMonth(2026, 3)).toHaveLength(2);
      expect(service.getByCategoryAndMonth('cat-1', 2026, 3)?.monthlyAmount).toBe(300000);
    });

    it('should not copy if current month already has budgets', () => {
      service.create({ categoryId: 'cat-1', monthlyAmount: 300000, year: 2026, month: 2 });
      service.create({ categoryId: 'cat-1', monthlyAmount: 500000, year: 2026, month: 3 });

      const copied = service.copyFromPreviousMonth(2026, 3);

      expect(copied).toBe(0);
      // 기존 값 유지
      expect(service.getByCategoryAndMonth('cat-1', 2026, 3)?.monthlyAmount).toBe(500000);
    });

    it('should handle January (copy from previous year December)', () => {
      service.create({ categoryId: 'cat-1', monthlyAmount: 300000, year: 2025, month: 12 });

      const copied = service.copyFromPreviousMonth(2026, 1);

      expect(copied).toBe(1);
      expect(service.getByCategoryAndMonth('cat-1', 2026, 1)?.monthlyAmount).toBe(300000);
    });

    it('should return 0 when previous month has no budgets', () => {
      expect(service.copyFromPreviousMonth(2026, 3)).toBe(0);
    });
  });
});
