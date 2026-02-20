import { SubCategoryService } from '../../src/services/SubCategoryService';
import { CreateSubCategoryInput, SubCategory } from '../../src/types';

describe('SubCategoryService', () => {
  let service: SubCategoryService;

  beforeEach(() => {
    service = new SubCategoryService();
  });

  describe('create', () => {
    it('should create a sub-category with generated id', () => {
      const input: CreateSubCategoryInput = {
        categoryId: 'cat-1',
        name: '간식/카페',
        icon: '☕',
      };

      const result = service.create(input);

      expect(result.id).toBeDefined();
      expect(result.id).toMatch(/^sub-category-/);
      expect(result.categoryId).toBe('cat-1');
      expect(result.name).toBe('간식/카페');
      expect(result.icon).toBe('☕');
    });

    it('should create a sub-category without icon', () => {
      const input: CreateSubCategoryInput = {
        categoryId: 'cat-1',
        name: '기타 식비',
      };

      const result = service.create(input);

      expect(result.name).toBe('기타 식비');
      expect(result.icon).toBeUndefined();
    });

    it('should generate unique ids for each sub-category', () => {
      const sub1 = service.create({ categoryId: 'cat-1', name: '소분류1' });
      const sub2 = service.create({ categoryId: 'cat-1', name: '소분류2' });

      expect(sub1.id).not.toBe(sub2.id);
    });
  });

  describe('getById', () => {
    it('should return sub-category by id', () => {
      const created = service.create({ categoryId: 'cat-1', name: '통신비', icon: '📱' });

      const result = service.getById(created.id);

      expect(result).toEqual(created);
    });

    it('should return undefined for non-existent id', () => {
      const result = service.getById('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return empty array when no sub-categories exist', () => {
      expect(service.getAll()).toEqual([]);
    });

    it('should return all sub-categories', () => {
      service.create({ categoryId: 'cat-1', name: '소분류1' });
      service.create({ categoryId: 'cat-2', name: '소분류2' });
      service.create({ categoryId: 'cat-1', name: '소분류3' });

      const result = service.getAll();

      expect(result).toHaveLength(3);
    });
  });

  describe('getByCategoryId', () => {
    it('should return sub-categories for a specific category', () => {
      service.create({ categoryId: 'cat-1', name: '간식/카페' });
      service.create({ categoryId: 'cat-1', name: '외식' });
      service.create({ categoryId: 'cat-2', name: '버스/지하철' });

      const result = service.getByCategoryId('cat-1');

      expect(result).toHaveLength(2);
      expect(result.every((sc) => sc.categoryId === 'cat-1')).toBe(true);
    });

    it('should return empty array for non-existent category', () => {
      service.create({ categoryId: 'cat-1', name: '간식' });

      const result = service.getByCategoryId('cat-999');

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update sub-category name', () => {
      const created = service.create({ categoryId: 'cat-1', name: '기존이름' });

      const updated = service.update(created.id, { name: '새이름' });

      expect(updated).toBeDefined();
      expect(updated!.name).toBe('새이름');
      expect(updated!.categoryId).toBe('cat-1');
    });

    it('should update sub-category icon', () => {
      const created = service.create({ categoryId: 'cat-1', name: '통신비', icon: '📱' });

      const updated = service.update(created.id, { icon: '📞' });

      expect(updated!.icon).toBe('📞');
      expect(updated!.name).toBe('통신비');
    });

    it('should update sub-category categoryId', () => {
      const created = service.create({ categoryId: 'cat-1', name: '이동 항목' });

      const updated = service.update(created.id, { categoryId: 'cat-2' });

      expect(updated!.categoryId).toBe('cat-2');
    });

    it('should not change id when updating', () => {
      const created = service.create({ categoryId: 'cat-1', name: '테스트' });

      const updated = service.update(created.id, { name: '수정됨' });

      expect(updated!.id).toBe(created.id);
    });

    it('should return undefined for non-existent id', () => {
      const result = service.update('non-existent', { name: '수정' });

      expect(result).toBeUndefined();
    });

    it('should persist the update', () => {
      const created = service.create({ categoryId: 'cat-1', name: '원래' });
      service.update(created.id, { name: '수정됨' });

      const fetched = service.getById(created.id);

      expect(fetched!.name).toBe('수정됨');
    });
  });

  describe('delete', () => {
    it('should delete an existing sub-category', () => {
      const created = service.create({ categoryId: 'cat-1', name: '삭제대상' });

      const result = service.delete(created.id);

      expect(result).toBe(true);
      expect(service.getById(created.id)).toBeUndefined();
    });

    it('should return false for non-existent id', () => {
      const result = service.delete('non-existent');

      expect(result).toBe(false);
    });

    it('should not affect other sub-categories', () => {
      const sub1 = service.create({ categoryId: 'cat-1', name: '유지' });
      const sub2 = service.create({ categoryId: 'cat-1', name: '삭제' });

      service.delete(sub2.id);

      expect(service.getAll()).toHaveLength(1);
      expect(service.getById(sub1.id)).toBeDefined();
    });
  });

  describe('clear', () => {
    it('should remove all sub-categories', () => {
      service.create({ categoryId: 'cat-1', name: '소분류1' });
      service.create({ categoryId: 'cat-2', name: '소분류2' });

      service.clear();

      expect(service.getAll()).toEqual([]);
    });

    it('should reset id counter', () => {
      service.create({ categoryId: 'cat-1', name: '첫번째' });
      service.clear();

      const newSub = service.create({ categoryId: 'cat-1', name: '새로운' });

      expect(newSub.id).toMatch(/^sub-category-1-/);
    });
  });
});
