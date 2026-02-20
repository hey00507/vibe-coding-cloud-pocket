import { TransactionService } from '../../src/services/TransactionService';

describe('TransactionService - getEnhancedMonthlySummary', () => {
  let service: TransactionService;

  beforeEach(() => {
    service = new TransactionService();
  });

  it('should return base summary fields', () => {
    service.create({
      type: 'income',
      amount: 3000000,
      date: new Date(2026, 0, 1),
      categoryId: 'cat-1',
      paymentMethodId: 'pm-1',
    });
    service.create({
      type: 'expense',
      amount: 1000000,
      date: new Date(2026, 0, 15),
      categoryId: 'cat-2',
      paymentMethodId: 'pm-1',
    });

    const result = service.getEnhancedMonthlySummary(2026, 1, 500000);

    expect(result.totalIncome).toBe(3000000);
    expect(result.totalExpense).toBe(1000000);
    expect(result.balance).toBe(2000000);
    expect(result.transactionCount).toBe(2);
  });

  it('should include totalSavings', () => {
    service.create({
      type: 'income',
      amount: 3000000,
      date: new Date(2026, 0, 1),
      categoryId: 'cat-1',
      paymentMethodId: 'pm-1',
    });

    const result = service.getEnhancedMonthlySummary(2026, 1, 500000);

    expect(result.totalSavings).toBe(500000);
  });

  it('should calculate savingsRate correctly', () => {
    service.create({
      type: 'income',
      amount: 3000000,
      date: new Date(2026, 0, 1),
      categoryId: 'cat-1',
      paymentMethodId: 'pm-1',
    });

    const result = service.getEnhancedMonthlySummary(2026, 1, 600000);

    expect(result.savingsRate).toBe(20); // 600000 / 3000000 = 20%
  });

  it('should calculate remainingCash correctly', () => {
    service.create({
      type: 'income',
      amount: 3000000,
      date: new Date(2026, 0, 1),
      categoryId: 'cat-1',
      paymentMethodId: 'pm-1',
    });
    service.create({
      type: 'expense',
      amount: 1500000,
      date: new Date(2026, 0, 15),
      categoryId: 'cat-2',
      paymentMethodId: 'pm-1',
    });

    const result = service.getEnhancedMonthlySummary(2026, 1, 500000);

    // 3000000 - 1500000 - 500000 = 1000000
    expect(result.remainingCash).toBe(1000000);
  });

  it('should handle zero income', () => {
    const result = service.getEnhancedMonthlySummary(2026, 1, 0);

    expect(result.savingsRate).toBe(0);
    expect(result.salarySavingsRate).toBe(0);
    expect(result.remainingCash).toBe(0);
  });

  it('should handle negative remainingCash', () => {
    service.create({
      type: 'income',
      amount: 1000000,
      date: new Date(2026, 0, 1),
      categoryId: 'cat-1',
      paymentMethodId: 'pm-1',
    });
    service.create({
      type: 'expense',
      amount: 800000,
      date: new Date(2026, 0, 15),
      categoryId: 'cat-2',
      paymentMethodId: 'pm-1',
    });

    const result = service.getEnhancedMonthlySummary(2026, 1, 500000);

    // 1000000 - 800000 - 500000 = -300000
    expect(result.remainingCash).toBe(-300000);
  });
});
