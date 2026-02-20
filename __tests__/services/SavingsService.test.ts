import { SavingsService } from '../../src/services/SavingsService';
import { ISavingsService } from '../../src/services/interfaces/ISavingsService';
import { CreateSavingsProductInput } from '../../src/types';

describe('SavingsService', () => {
  let service: ISavingsService;

  const createTestInput = (
    overrides: Partial<CreateSavingsProductInput> = {}
  ): CreateSavingsProductInput => ({
    name: '청년적금',
    status: 'active',
    interestRate: 4.5,
    bank: '국민은행',
    monthlyAmount: 300000,
    paidMonths: 6,
    currentAmount: 1800000,
    ...overrides,
  });

  beforeEach(() => {
    service = new SavingsService();
  });

  describe('create', () => {
    it('should create a new savings product with generated id', () => {
      const input = createTestInput();

      const result = service.create(input);

      expect(result.id).toBeDefined();
      expect(result.id).toMatch(/^savings-/);
      expect(result.name).toBe('청년적금');
      expect(result.status).toBe('active');
      expect(result.interestRate).toBe(4.5);
      expect(result.bank).toBe('국민은행');
      expect(result.monthlyAmount).toBe(300000);
      expect(result.paidMonths).toBe(6);
      expect(result.currentAmount).toBe(1800000);
    });

    it('should create a product with optional fields', () => {
      const input = createTestInput({
        startDate: new Date('2025-01-01'),
        endDate: new Date('2026-01-01'),
        memo: '청년 우대 적금',
      });

      const result = service.create(input);

      expect(result.startDate).toEqual(new Date('2025-01-01'));
      expect(result.endDate).toEqual(new Date('2026-01-01'));
      expect(result.memo).toBe('청년 우대 적금');
    });

    it('should create a product without optional fields', () => {
      const input = createTestInput();

      const result = service.create(input);

      expect(result.startDate).toBeUndefined();
      expect(result.endDate).toBeUndefined();
      expect(result.memo).toBeUndefined();
    });

    it('should generate unique ids for each product', () => {
      const result1 = service.create(createTestInput());
      const result2 = service.create(createTestInput({ name: '자유적금' }));

      expect(result1.id).not.toBe(result2.id);
    });

    it('should create a pending status product', () => {
      const result = service.create(createTestInput({ status: 'pending' }));

      expect(result.status).toBe('pending');
    });
  });

  describe('getById', () => {
    it('should return product when found', () => {
      const created = service.create(createTestInput());

      const result = service.getById(created.id);

      expect(result).toEqual(created);
    });

    it('should return undefined when not found', () => {
      const result = service.getById('non-existent-id');

      expect(result).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return empty array when no products exist', () => {
      const result = service.getAll();

      expect(result).toEqual([]);
    });

    it('should return all products', () => {
      service.create(createTestInput());
      service.create(createTestInput({ name: '자유적금' }));
      service.create(createTestInput({ name: '정기예금' }));

      const result = service.getAll();

      expect(result).toHaveLength(3);
    });
  });

  describe('getByStatus', () => {
    beforeEach(() => {
      service.create(createTestInput({ name: '적금1', status: 'active' }));
      service.create(createTestInput({ name: '적금2', status: 'pending' }));
      service.create(createTestInput({ name: '적금3', status: 'active' }));
      service.create(createTestInput({ name: '적금4', status: 'pending' }));
    });

    it('should return only active products', () => {
      const result = service.getByStatus('active');

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.status === 'active')).toBe(true);
    });

    it('should return only pending products', () => {
      const result = service.getByStatus('pending');

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.status === 'pending')).toBe(true);
    });

    it('should return empty array when no products with status exist', () => {
      service.clear();
      service.create(createTestInput({ status: 'active' }));

      const result = service.getByStatus('pending');

      expect(result).toEqual([]);
    });
  });

  describe('getTotalCurrentAmount', () => {
    it('should return 0 when no products exist', () => {
      const result = service.getTotalCurrentAmount();

      expect(result).toBe(0);
    });

    it('should return sum of all current amounts', () => {
      service.create(createTestInput({ currentAmount: 1000000 }));
      service.create(createTestInput({ currentAmount: 2000000 }));
      service.create(createTestInput({ currentAmount: 500000 }));

      const result = service.getTotalCurrentAmount();

      expect(result).toBe(3500000);
    });

    it('should include both active and pending products', () => {
      service.create(createTestInput({ status: 'active', currentAmount: 1000000 }));
      service.create(createTestInput({ status: 'pending', currentAmount: 500000 }));

      const result = service.getTotalCurrentAmount();

      expect(result).toBe(1500000);
    });
  });

  describe('getMonthlySavingsTotal', () => {
    it('should return 0 when no products exist', () => {
      const result = service.getMonthlySavingsTotal();

      expect(result).toBe(0);
    });

    it('should return sum of monthly amounts for active products only', () => {
      service.create(createTestInput({ status: 'active', monthlyAmount: 300000 }));
      service.create(createTestInput({ status: 'active', monthlyAmount: 200000 }));
      service.create(createTestInput({ status: 'pending', monthlyAmount: 100000 }));

      const result = service.getMonthlySavingsTotal();

      expect(result).toBe(500000);
    });

    it('should return 0 when only pending products exist', () => {
      service.create(createTestInput({ status: 'pending', monthlyAmount: 300000 }));
      service.create(createTestInput({ status: 'pending', monthlyAmount: 200000 }));

      const result = service.getMonthlySavingsTotal();

      expect(result).toBe(0);
    });
  });

  describe('update', () => {
    it('should update product name', () => {
      const created = service.create(createTestInput());

      const result = service.update(created.id, { name: '새 적금' });

      expect(result).toBeDefined();
      expect(result!.name).toBe('새 적금');
      expect(result!.bank).toBe('국민은행');
    });

    it('should update product status', () => {
      const created = service.create(createTestInput({ status: 'pending' }));

      const result = service.update(created.id, { status: 'active' });

      expect(result).toBeDefined();
      expect(result!.status).toBe('active');
    });

    it('should update multiple fields at once', () => {
      const created = service.create(createTestInput());

      const result = service.update(created.id, {
        interestRate: 5.0,
        paidMonths: 12,
        currentAmount: 3600000,
        memo: '금리 인상',
      });

      expect(result).toBeDefined();
      expect(result!.interestRate).toBe(5.0);
      expect(result!.paidMonths).toBe(12);
      expect(result!.currentAmount).toBe(3600000);
      expect(result!.memo).toBe('금리 인상');
    });

    it('should return undefined when product not found', () => {
      const result = service.update('non-existent-id', { name: '새이름' });

      expect(result).toBeUndefined();
    });

    it('should persist update in storage', () => {
      const created = service.create(createTestInput({ currentAmount: 1000000 }));
      service.update(created.id, { currentAmount: 2000000 });

      const fetched = service.getById(created.id);

      expect(fetched!.currentAmount).toBe(2000000);
    });
  });

  describe('delete', () => {
    it('should delete existing product and return true', () => {
      const created = service.create(createTestInput());

      const result = service.delete(created.id);

      expect(result).toBe(true);
      expect(service.getById(created.id)).toBeUndefined();
    });

    it('should return false when product not found', () => {
      const result = service.delete('non-existent-id');

      expect(result).toBe(false);
    });

    it('should not affect other products', () => {
      const p1 = service.create(createTestInput({ name: '적금1' }));
      const p2 = service.create(createTestInput({ name: '적금2' }));

      service.delete(p1.id);

      expect(service.getById(p2.id)).toBeDefined();
      expect(service.getAll()).toHaveLength(1);
    });
  });

  describe('clear', () => {
    it('should remove all products', () => {
      service.create(createTestInput());
      service.create(createTestInput({ name: '자유적금' }));

      service.clear();

      expect(service.getAll()).toEqual([]);
    });

    it('should reset id counter', () => {
      service.create(createTestInput());
      service.clear();

      const newProduct = service.create(createTestInput());

      expect(newProduct.id).toMatch(/^savings-1-/);
    });
  });
});
