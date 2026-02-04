import { CategoryService } from '../../src/services/CategoryService';
import { ICategoryService } from '../../src/services/interfaces/ICategoryService';
import { Category, CreateCategoryInput } from '../../src/types';

describe('CategoryService', () => {
  let service: ICategoryService;

  beforeEach(() => {
    service = new CategoryService();
  });

  describe('create', () => {
    it('should create a new category with generated id', () => {
      const input: CreateCategoryInput = {
        name: '식비',
        type: 'expense',
        icon: '🍔',
        color: '#FF5733',
      };

      const result = service.create(input);

      expect(result.id).toBeDefined();
      expect(result.name).toBe('식비');
      expect(result.type).toBe('expense');
      expect(result.icon).toBe('🍔');
      expect(result.color).toBe('#FF5733');
    });

    it('should create a category without optional fields', () => {
      const input: CreateCategoryInput = {
        name: '급여',
        type: 'income',
      };

      const result = service.create(input);

      expect(result.id).toBeDefined();
      expect(result.name).toBe('급여');
      expect(result.type).toBe('income');
      expect(result.icon).toBeUndefined();
      expect(result.color).toBeUndefined();
    });

    it('should generate unique ids for each category', () => {
      const input1: CreateCategoryInput = { name: '식비', type: 'expense' };
      const input2: CreateCategoryInput = { name: '교통비', type: 'expense' };

      const result1 = service.create(input1);
      const result2 = service.create(input2);

      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe('getById', () => {
    it('should return category when found', () => {
      const input: CreateCategoryInput = { name: '식비', type: 'expense' };
      const created = service.create(input);

      const result = service.getById(created.id);

      expect(result).toEqual(created);
    });

    it('should return undefined when not found', () => {
      const result = service.getById('non-existent-id');

      expect(result).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return empty array when no categories exist', () => {
      const result = service.getAll();

      expect(result).toEqual([]);
    });

    it('should return all categories', () => {
      service.create({ name: '식비', type: 'expense' });
      service.create({ name: '급여', type: 'income' });
      service.create({ name: '교통비', type: 'expense' });

      const result = service.getAll();

      expect(result).toHaveLength(3);
    });
  });

  describe('getByType', () => {
    beforeEach(() => {
      service.create({ name: '식비', type: 'expense' });
      service.create({ name: '급여', type: 'income' });
      service.create({ name: '교통비', type: 'expense' });
      service.create({ name: '보너스', type: 'income' });
    });

    it('should return only expense categories', () => {
      const result = service.getByType('expense');

      expect(result).toHaveLength(2);
      expect(result.every((c) => c.type === 'expense')).toBe(true);
    });

    it('should return only income categories', () => {
      const result = service.getByType('income');

      expect(result).toHaveLength(2);
      expect(result.every((c) => c.type === 'income')).toBe(true);
    });

    it('should return empty array when no categories of type exist', () => {
      service.clear();
      service.create({ name: '식비', type: 'expense' });

      const result = service.getByType('income');

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update category name', () => {
      const created = service.create({ name: '식비', type: 'expense' });

      const result = service.update(created.id, { name: '외식비' });

      expect(result).toBeDefined();
      expect(result!.name).toBe('외식비');
      expect(result!.type).toBe('expense');
    });

    it('should update category type', () => {
      const created = service.create({ name: '기타', type: 'expense' });

      const result = service.update(created.id, { type: 'income' });

      expect(result).toBeDefined();
      expect(result!.type).toBe('income');
    });

    it('should update optional fields', () => {
      const created = service.create({ name: '식비', type: 'expense' });

      const result = service.update(created.id, {
        icon: '🍕',
        color: '#00FF00',
      });

      expect(result).toBeDefined();
      expect(result!.icon).toBe('🍕');
      expect(result!.color).toBe('#00FF00');
    });

    it('should return undefined when category not found', () => {
      const result = service.update('non-existent-id', { name: '새이름' });

      expect(result).toBeUndefined();
    });

    it('should persist update in storage', () => {
      const created = service.create({ name: '식비', type: 'expense' });
      service.update(created.id, { name: '외식비' });

      const fetched = service.getById(created.id);

      expect(fetched!.name).toBe('외식비');
    });
  });

  describe('delete', () => {
    it('should delete existing category and return true', () => {
      const created = service.create({ name: '식비', type: 'expense' });

      const result = service.delete(created.id);

      expect(result).toBe(true);
      expect(service.getById(created.id)).toBeUndefined();
    });

    it('should return false when category not found', () => {
      const result = service.delete('non-existent-id');

      expect(result).toBe(false);
    });

    it('should not affect other categories', () => {
      const cat1 = service.create({ name: '식비', type: 'expense' });
      const cat2 = service.create({ name: '교통비', type: 'expense' });

      service.delete(cat1.id);

      expect(service.getById(cat2.id)).toBeDefined();
      expect(service.getAll()).toHaveLength(1);
    });
  });

  describe('clear', () => {
    it('should remove all categories', () => {
      service.create({ name: '식비', type: 'expense' });
      service.create({ name: '급여', type: 'income' });

      service.clear();

      expect(service.getAll()).toEqual([]);
    });
  });
});
