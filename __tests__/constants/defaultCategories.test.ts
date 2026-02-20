import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_PAYMENT_METHODS,
} from '../../src/constants/defaultCategories';

describe('defaultCategories', () => {
  describe('DEFAULT_EXPENSE_CATEGORIES', () => {
    it('should have 10 expense categories', () => {
      expect(DEFAULT_EXPENSE_CATEGORIES).toHaveLength(10);
    });

    it('should all be expense type', () => {
      DEFAULT_EXPENSE_CATEGORIES.forEach((cat) => {
        expect(cat.type).toBe('expense');
      });
    });

    it('should all have icons', () => {
      DEFAULT_EXPENSE_CATEGORIES.forEach((cat) => {
        expect(cat.icon).toBeTruthy();
      });
    });

    it('should all have sub-categories', () => {
      DEFAULT_EXPENSE_CATEGORIES.forEach((cat) => {
        expect(cat.subCategories.length).toBeGreaterThan(0);
      });
    });

    it('should have sub-categories with name and icon', () => {
      DEFAULT_EXPENSE_CATEGORIES.forEach((cat) => {
        cat.subCategories.forEach((sub) => {
          expect(sub.name).toBeTruthy();
          expect(sub.icon).toBeTruthy();
        });
      });
    });

    it('should include expected categories', () => {
      const names = DEFAULT_EXPENSE_CATEGORIES.map((c) => c.name);
      expect(names).toContain('고정비');
      expect(names).toContain('식비');
      expect(names).toContain('교통비');
      expect(names).toContain('생활용품');
      expect(names).toContain('의료/건강');
      expect(names).toContain('문화/여가');
      expect(names).toContain('교육');
      expect(names).toContain('경조사/선물');
      expect(names).toContain('반려동물');
      expect(names).toContain('기타지출');
    });
  });

  describe('DEFAULT_INCOME_CATEGORIES', () => {
    it('should have 5 income categories', () => {
      expect(DEFAULT_INCOME_CATEGORIES).toHaveLength(5);
    });

    it('should all be income type', () => {
      DEFAULT_INCOME_CATEGORIES.forEach((cat) => {
        expect(cat.type).toBe('income');
      });
    });

    it('should have no sub-categories (flat)', () => {
      DEFAULT_INCOME_CATEGORIES.forEach((cat) => {
        expect(cat.subCategories).toHaveLength(0);
      });
    });

    it('should include expected income categories', () => {
      const names = DEFAULT_INCOME_CATEGORIES.map((c) => c.name);
      expect(names).toContain('월급');
      expect(names).toContain('상여금');
      expect(names).toContain('금융소득');
      expect(names).toContain('부수입');
      expect(names).toContain('기타수입');
    });
  });

  describe('DEFAULT_PAYMENT_METHODS', () => {
    it('should have 3 default payment methods', () => {
      expect(DEFAULT_PAYMENT_METHODS).toHaveLength(3);
    });

    it('should all have name, icon, and type', () => {
      DEFAULT_PAYMENT_METHODS.forEach((pm) => {
        expect(pm.name).toBeTruthy();
        expect(pm.icon).toBeTruthy();
        expect(pm.type).toBeTruthy();
      });
    });

    it('should include expected payment methods', () => {
      const names = DEFAULT_PAYMENT_METHODS.map((p) => p.name);
      expect(names).toContain('신한카드');
      expect(names).toContain('현대카드');
      expect(names).toContain('현금');
    });
  });
});
