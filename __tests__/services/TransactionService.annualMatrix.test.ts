import { TransactionService } from '../../src/services/TransactionService';

describe('TransactionService - getAnnualCategoryMatrix', () => {
  let service: TransactionService;

  beforeEach(() => {
    service = new TransactionService();
  });

  it('should return empty array when no transactions', () => {
    const categoryMap = new Map([['cat-1', '식비']]);
    const result = service.getAnnualCategoryMatrix(2026, categoryMap);

    expect(result).toEqual([]);
  });

  it('should return matrix for single category single month', () => {
    service.create({
      type: 'expense',
      amount: 50000,
      date: new Date(2026, 0, 15), // January
      categoryId: 'cat-1',
      paymentMethodId: 'pm-1',
    });

    const categoryMap = new Map([['cat-1', '식비']]);
    const result = service.getAnnualCategoryMatrix(2026, categoryMap);

    expect(result).toHaveLength(1);
    expect(result[0].categoryId).toBe('cat-1');
    expect(result[0].categoryName).toBe('식비');
    expect(result[0].monthlyAmounts[0]).toBe(50000); // January
    expect(result[0].monthlyAmounts[1]).toBe(0); // February
    expect(result[0].total).toBe(50000);
  });

  it('should aggregate amounts within same month', () => {
    service.create({
      type: 'expense',
      amount: 30000,
      date: new Date(2026, 2, 5),
      categoryId: 'cat-1',
      paymentMethodId: 'pm-1',
    });
    service.create({
      type: 'expense',
      amount: 20000,
      date: new Date(2026, 2, 20),
      categoryId: 'cat-1',
      paymentMethodId: 'pm-1',
    });

    const categoryMap = new Map([['cat-1', '식비']]);
    const result = service.getAnnualCategoryMatrix(2026, categoryMap);

    expect(result[0].monthlyAmounts[2]).toBe(50000); // March (index 2)
    expect(result[0].total).toBe(50000);
  });

  it('should handle multiple categories', () => {
    service.create({
      type: 'expense',
      amount: 60000,
      date: new Date(2026, 0, 15),
      categoryId: 'cat-1',
      paymentMethodId: 'pm-1',
    });
    service.create({
      type: 'expense',
      amount: 40000,
      date: new Date(2026, 0, 20),
      categoryId: 'cat-2',
      paymentMethodId: 'pm-1',
    });

    const categoryMap = new Map([
      ['cat-1', '식비'],
      ['cat-2', '교통비'],
    ]);
    const result = service.getAnnualCategoryMatrix(2026, categoryMap);

    expect(result).toHaveLength(2);
    // Sorted by total descending
    expect(result[0].categoryName).toBe('식비');
    expect(result[1].categoryName).toBe('교통비');
  });

  it('should only include expense transactions', () => {
    service.create({
      type: 'expense',
      amount: 50000,
      date: new Date(2026, 0, 15),
      categoryId: 'cat-1',
      paymentMethodId: 'pm-1',
    });
    service.create({
      type: 'income',
      amount: 3000000,
      date: new Date(2026, 0, 1),
      categoryId: 'cat-1',
      paymentMethodId: 'pm-1',
    });

    const categoryMap = new Map([['cat-1', '식비']]);
    const result = service.getAnnualCategoryMatrix(2026, categoryMap);

    expect(result).toHaveLength(1);
    expect(result[0].total).toBe(50000);
  });

  it('should only include specified year', () => {
    service.create({
      type: 'expense',
      amount: 50000,
      date: new Date(2025, 0, 15),
      categoryId: 'cat-1',
      paymentMethodId: 'pm-1',
    });
    service.create({
      type: 'expense',
      amount: 30000,
      date: new Date(2026, 0, 15),
      categoryId: 'cat-1',
      paymentMethodId: 'pm-1',
    });

    const categoryMap = new Map([['cat-1', '식비']]);
    const result = service.getAnnualCategoryMatrix(2026, categoryMap);

    expect(result[0].total).toBe(30000);
  });

  it('should have 12 months in monthlyAmounts', () => {
    service.create({
      type: 'expense',
      amount: 50000,
      date: new Date(2026, 5, 15),
      categoryId: 'cat-1',
      paymentMethodId: 'pm-1',
    });

    const categoryMap = new Map([['cat-1', '식비']]);
    const result = service.getAnnualCategoryMatrix(2026, categoryMap);

    expect(result[0].monthlyAmounts).toHaveLength(12);
  });

  it('should sort by total amount descending', () => {
    service.create({
      type: 'expense',
      amount: 10000,
      date: new Date(2026, 0, 1),
      categoryId: 'cat-1',
      paymentMethodId: 'pm-1',
    });
    service.create({
      type: 'expense',
      amount: 50000,
      date: new Date(2026, 0, 1),
      categoryId: 'cat-2',
      paymentMethodId: 'pm-1',
    });
    service.create({
      type: 'expense',
      amount: 30000,
      date: new Date(2026, 0, 1),
      categoryId: 'cat-3',
      paymentMethodId: 'pm-1',
    });

    const categoryMap = new Map([
      ['cat-1', '교육'],
      ['cat-2', '식비'],
      ['cat-3', '교통비'],
    ]);
    const result = service.getAnnualCategoryMatrix(2026, categoryMap);

    expect(result[0].total).toBe(50000);
    expect(result[1].total).toBe(30000);
    expect(result[2].total).toBe(10000);
  });

  it('should use fallback name for unknown categories', () => {
    service.create({
      type: 'expense',
      amount: 10000,
      date: new Date(2026, 0, 1),
      categoryId: 'unknown-cat',
      paymentMethodId: 'pm-1',
    });

    const result = service.getAnnualCategoryMatrix(2026, new Map());

    expect(result[0].categoryName).toBe('미분류');
  });

  it('should handle transactions across all 12 months', () => {
    for (let m = 0; m < 12; m++) {
      service.create({
        type: 'expense',
        amount: (m + 1) * 10000,
        date: new Date(2026, m, 15),
        categoryId: 'cat-1',
        paymentMethodId: 'pm-1',
      });
    }

    const categoryMap = new Map([['cat-1', '식비']]);
    const result = service.getAnnualCategoryMatrix(2026, categoryMap);

    expect(result[0].monthlyAmounts[0]).toBe(10000);
    expect(result[0].monthlyAmounts[11]).toBe(120000);
    expect(result[0].total).toBe(780000); // sum of 10k*1 + 10k*2 + ... + 10k*12
  });
});
