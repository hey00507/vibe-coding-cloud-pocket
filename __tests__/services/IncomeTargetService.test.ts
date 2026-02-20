import { IncomeTargetService } from '../../src/services/IncomeTargetService';
import { CreateIncomeTargetInput } from '../../src/types';

describe('IncomeTargetService', () => {
  let service: IncomeTargetService;

  beforeEach(() => {
    service = new IncomeTargetService();
  });

  describe('create', () => {
    it('should create an income target with generated id', () => {
      const input: CreateIncomeTargetInput = {
        categoryId: 'cat-1',
        year: 2026,
        month: 2,
        targetAmount: 3000000,
      };

      const result = service.create(input);

      expect(result.id).toBeDefined();
      expect(result.id).toMatch(/^income-target-/);
      expect(result.categoryId).toBe('cat-1');
      expect(result.year).toBe(2026);
      expect(result.month).toBe(2);
      expect(result.targetAmount).toBe(3000000);
    });

    it('should generate unique ids', () => {
      const t1 = service.create({ categoryId: 'cat-1', year: 2026, month: 1, targetAmount: 100 });
      const t2 = service.create({ categoryId: 'cat-1', year: 2026, month: 2, targetAmount: 200 });

      expect(t1.id).not.toBe(t2.id);
    });
  });

  describe('getById', () => {
    it('should return target by id', () => {
      const created = service.create({ categoryId: 'cat-1', year: 2026, month: 1, targetAmount: 100 });

      expect(service.getById(created.id)).toEqual(created);
    });

    it('should return undefined for non-existent id', () => {
      expect(service.getById('non-existent')).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return empty array initially', () => {
      expect(service.getAll()).toEqual([]);
    });

    it('should return all targets', () => {
      service.create({ categoryId: 'cat-1', year: 2026, month: 1, targetAmount: 100 });
      service.create({ categoryId: 'cat-2', year: 2026, month: 1, targetAmount: 200 });

      expect(service.getAll()).toHaveLength(2);
    });
  });

  describe('getByMonth', () => {
    it('should return targets for specific month', () => {
      service.create({ categoryId: 'cat-1', year: 2026, month: 1, targetAmount: 100 });
      service.create({ categoryId: 'cat-2', year: 2026, month: 1, targetAmount: 200 });
      service.create({ categoryId: 'cat-1', year: 2026, month: 2, targetAmount: 300 });

      const result = service.getByMonth(2026, 1);

      expect(result).toHaveLength(2);
      expect(result.every((t) => t.year === 2026 && t.month === 1)).toBe(true);
    });

    it('should return empty array for no matching month', () => {
      service.create({ categoryId: 'cat-1', year: 2026, month: 1, targetAmount: 100 });

      expect(service.getByMonth(2026, 3)).toEqual([]);
    });

    it('should filter by year correctly', () => {
      service.create({ categoryId: 'cat-1', year: 2025, month: 1, targetAmount: 100 });
      service.create({ categoryId: 'cat-1', year: 2026, month: 1, targetAmount: 200 });

      const result = service.getByMonth(2026, 1);

      expect(result).toHaveLength(1);
      expect(result[0].targetAmount).toBe(200);
    });
  });

  describe('update', () => {
    it('should update target amount', () => {
      const created = service.create({ categoryId: 'cat-1', year: 2026, month: 1, targetAmount: 100 });

      const updated = service.update(created.id, { targetAmount: 500 });

      expect(updated!.targetAmount).toBe(500);
      expect(updated!.categoryId).toBe('cat-1');
    });

    it('should return undefined for non-existent id', () => {
      expect(service.update('non-existent', { targetAmount: 100 })).toBeUndefined();
    });

    it('should persist the update', () => {
      const created = service.create({ categoryId: 'cat-1', year: 2026, month: 1, targetAmount: 100 });
      service.update(created.id, { targetAmount: 999 });

      expect(service.getById(created.id)!.targetAmount).toBe(999);
    });
  });

  describe('delete', () => {
    it('should delete an existing target', () => {
      const created = service.create({ categoryId: 'cat-1', year: 2026, month: 1, targetAmount: 100 });

      expect(service.delete(created.id)).toBe(true);
      expect(service.getById(created.id)).toBeUndefined();
    });

    it('should return false for non-existent id', () => {
      expect(service.delete('non-existent')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all targets', () => {
      service.create({ categoryId: 'cat-1', year: 2026, month: 1, targetAmount: 100 });
      service.create({ categoryId: 'cat-2', year: 2026, month: 2, targetAmount: 200 });

      service.clear();

      expect(service.getAll()).toEqual([]);
    });

    it('should reset id counter', () => {
      service.create({ categoryId: 'cat-1', year: 2026, month: 1, targetAmount: 100 });
      service.clear();

      const newTarget = service.create({ categoryId: 'cat-1', year: 2026, month: 1, targetAmount: 200 });

      expect(newTarget.id).toMatch(/^income-target-1-/);
    });
  });
});
