import { TransactionService } from '../../src/services/TransactionService';
import { ITransactionService } from '../../src/services/interfaces/ITransactionService';
import {
  CreateTransactionInput,
  Transaction,
  PeriodSummary,
  CategoryBreakdown,
  PaymentMethodBreakdown,
} from '../../src/types';

describe('TransactionService', () => {
  let service: ITransactionService;

  const createTestInput = (
    overrides: Partial<CreateTransactionInput> = {}
  ): CreateTransactionInput => ({
    type: 'expense',
    amount: 10000,
    date: new Date('2024-01-15'),
    categoryId: 'category-1',
    paymentMethodId: 'payment-1',
    memo: '테스트 거래',
    ...overrides,
  });

  beforeEach(() => {
    service = new TransactionService();
  });

  describe('create', () => {
    it('should create a new transaction with generated id', () => {
      const input = createTestInput();

      const result = service.create(input);

      expect(result.id).toBeDefined();
      expect(result.type).toBe('expense');
      expect(result.amount).toBe(10000);
      expect(result.date).toEqual(new Date('2024-01-15'));
      expect(result.categoryId).toBe('category-1');
      expect(result.paymentMethodId).toBe('payment-1');
      expect(result.memo).toBe('테스트 거래');
    });

    it('should create a transaction without optional memo', () => {
      const input = createTestInput({ memo: undefined });

      const result = service.create(input);

      expect(result.id).toBeDefined();
      expect(result.memo).toBeUndefined();
    });

    it('should generate unique ids for each transaction', () => {
      const input1 = createTestInput();
      const input2 = createTestInput();

      const result1 = service.create(input1);
      const result2 = service.create(input2);

      expect(result1.id).not.toBe(result2.id);
    });

    it('should create income transaction', () => {
      const input = createTestInput({ type: 'income', amount: 3000000 });

      const result = service.create(input);

      expect(result.type).toBe('income');
      expect(result.amount).toBe(3000000);
    });
  });

  describe('getById', () => {
    it('should return transaction when found', () => {
      const input = createTestInput();
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
    it('should return empty array when no transactions exist', () => {
      const result = service.getAll();

      expect(result).toEqual([]);
    });

    it('should return all transactions', () => {
      service.create(createTestInput());
      service.create(createTestInput({ type: 'income' }));
      service.create(createTestInput());

      const result = service.getAll();

      expect(result).toHaveLength(3);
    });
  });

  describe('getByType', () => {
    beforeEach(() => {
      service.create(createTestInput({ type: 'expense', amount: 10000 }));
      service.create(createTestInput({ type: 'income', amount: 50000 }));
      service.create(createTestInput({ type: 'expense', amount: 20000 }));
      service.create(createTestInput({ type: 'income', amount: 100000 }));
    });

    it('should return only expense transactions', () => {
      const result = service.getByType('expense');

      expect(result).toHaveLength(2);
      expect(result.every((t) => t.type === 'expense')).toBe(true);
    });

    it('should return only income transactions', () => {
      const result = service.getByType('income');

      expect(result).toHaveLength(2);
      expect(result.every((t) => t.type === 'income')).toBe(true);
    });

    it('should return empty array when no transactions of type exist', () => {
      service.clear();
      service.create(createTestInput({ type: 'expense' }));

      const result = service.getByType('income');

      expect(result).toEqual([]);
    });
  });

  describe('getByDateRange', () => {
    beforeEach(() => {
      service.create(createTestInput({ date: new Date('2024-01-01') }));
      service.create(createTestInput({ date: new Date('2024-01-15') }));
      service.create(createTestInput({ date: new Date('2024-01-31') }));
      service.create(createTestInput({ date: new Date('2024-02-15') }));
    });

    it('should return transactions within date range', () => {
      const result = service.getByDateRange(
        new Date('2024-01-10'),
        new Date('2024-01-20')
      );

      expect(result).toHaveLength(1);
      expect(result[0].date).toEqual(new Date('2024-01-15'));
    });

    it('should include transactions on boundary dates', () => {
      const result = service.getByDateRange(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(result).toHaveLength(3);
    });

    it('should return empty array when no transactions in range', () => {
      const result = service.getByDateRange(
        new Date('2024-03-01'),
        new Date('2024-03-31')
      );

      expect(result).toEqual([]);
    });
  });

  describe('getByCategoryId', () => {
    beforeEach(() => {
      service.create(createTestInput({ categoryId: 'food' }));
      service.create(createTestInput({ categoryId: 'transport' }));
      service.create(createTestInput({ categoryId: 'food' }));
    });

    it('should return transactions by category', () => {
      const result = service.getByCategoryId('food');

      expect(result).toHaveLength(2);
      expect(result.every((t) => t.categoryId === 'food')).toBe(true);
    });

    it('should return empty array when no transactions with category', () => {
      const result = service.getByCategoryId('entertainment');

      expect(result).toEqual([]);
    });
  });

  describe('getByPaymentMethodId', () => {
    beforeEach(() => {
      service.create(createTestInput({ paymentMethodId: 'card' }));
      service.create(createTestInput({ paymentMethodId: 'cash' }));
      service.create(createTestInput({ paymentMethodId: 'card' }));
    });

    it('should return transactions by payment method', () => {
      const result = service.getByPaymentMethodId('card');

      expect(result).toHaveLength(2);
      expect(result.every((t) => t.paymentMethodId === 'card')).toBe(true);
    });

    it('should return empty array when no transactions with payment method', () => {
      const result = service.getByPaymentMethodId('bank-transfer');

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update transaction amount', () => {
      const created = service.create(createTestInput({ amount: 10000 }));

      const result = service.update(created.id, { amount: 15000 });

      expect(result).toBeDefined();
      expect(result!.amount).toBe(15000);
    });

    it('should update transaction type', () => {
      const created = service.create(createTestInput({ type: 'expense' }));

      const result = service.update(created.id, { type: 'income' });

      expect(result).toBeDefined();
      expect(result!.type).toBe('income');
    });

    it('should update transaction date', () => {
      const created = service.create(createTestInput());
      const newDate = new Date('2024-02-20');

      const result = service.update(created.id, { date: newDate });

      expect(result).toBeDefined();
      expect(result!.date).toEqual(newDate);
    });

    it('should update transaction memo', () => {
      const created = service.create(createTestInput({ memo: '원래 메모' }));

      const result = service.update(created.id, { memo: '수정된 메모' });

      expect(result).toBeDefined();
      expect(result!.memo).toBe('수정된 메모');
    });

    it('should update multiple fields at once', () => {
      const created = service.create(createTestInput());

      const result = service.update(created.id, {
        amount: 25000,
        categoryId: 'new-category',
        memo: '새 메모',
      });

      expect(result).toBeDefined();
      expect(result!.amount).toBe(25000);
      expect(result!.categoryId).toBe('new-category');
      expect(result!.memo).toBe('새 메모');
    });

    it('should return undefined when transaction not found', () => {
      const result = service.update('non-existent-id', { amount: 10000 });

      expect(result).toBeUndefined();
    });

    it('should persist update in storage', () => {
      const created = service.create(createTestInput({ amount: 10000 }));
      service.update(created.id, { amount: 20000 });

      const fetched = service.getById(created.id);

      expect(fetched!.amount).toBe(20000);
    });
  });

  describe('delete', () => {
    it('should delete existing transaction and return true', () => {
      const created = service.create(createTestInput());

      const result = service.delete(created.id);

      expect(result).toBe(true);
      expect(service.getById(created.id)).toBeUndefined();
    });

    it('should return false when transaction not found', () => {
      const result = service.delete('non-existent-id');

      expect(result).toBe(false);
    });

    it('should not affect other transactions', () => {
      const t1 = service.create(createTestInput());
      const t2 = service.create(createTestInput());

      service.delete(t1.id);

      expect(service.getById(t2.id)).toBeDefined();
      expect(service.getAll()).toHaveLength(1);
    });
  });

  describe('clear', () => {
    it('should remove all transactions', () => {
      service.create(createTestInput());
      service.create(createTestInput());

      service.clear();

      expect(service.getAll()).toEqual([]);
    });
  });

  describe('getTotalIncome', () => {
    it('should return 0 when no transactions', () => {
      const result = service.getTotalIncome();

      expect(result).toBe(0);
    });

    it('should return sum of all income transactions', () => {
      service.create(createTestInput({ type: 'income', amount: 100000 }));
      service.create(createTestInput({ type: 'income', amount: 50000 }));
      service.create(createTestInput({ type: 'expense', amount: 10000 }));

      const result = service.getTotalIncome();

      expect(result).toBe(150000);
    });
  });

  describe('getTotalExpense', () => {
    it('should return 0 when no transactions', () => {
      const result = service.getTotalExpense();

      expect(result).toBe(0);
    });

    it('should return sum of all expense transactions', () => {
      service.create(createTestInput({ type: 'expense', amount: 10000 }));
      service.create(createTestInput({ type: 'expense', amount: 20000 }));
      service.create(createTestInput({ type: 'income', amount: 100000 }));

      const result = service.getTotalExpense();

      expect(result).toBe(30000);
    });
  });

  describe('getBalance', () => {
    it('should return 0 when no transactions', () => {
      const result = service.getBalance();

      expect(result).toBe(0);
    });

    it('should return income minus expense', () => {
      service.create(createTestInput({ type: 'income', amount: 100000 }));
      service.create(createTestInput({ type: 'expense', amount: 30000 }));
      service.create(createTestInput({ type: 'expense', amount: 20000 }));

      const result = service.getBalance();

      expect(result).toBe(50000);
    });

    it('should handle negative balance', () => {
      service.create(createTestInput({ type: 'income', amount: 10000 }));
      service.create(createTestInput({ type: 'expense', amount: 50000 }));

      const result = service.getBalance();

      expect(result).toBe(-40000);
    });
  });

  describe('getByDate', () => {
    beforeEach(() => {
      service.create(
        createTestInput({ date: new Date('2024-01-15'), amount: 10000 })
      );
      service.create(
        createTestInput({ date: new Date('2024-01-15'), amount: 5000 })
      );
      service.create(
        createTestInput({ date: new Date('2024-01-16'), amount: 20000 })
      );
    });

    it('should return transactions for specific date', () => {
      const result = service.getByDate(new Date('2024-01-15'));

      expect(result).toHaveLength(2);
      result.forEach((t) => {
        expect(t.date.toISOString().split('T')[0]).toBe('2024-01-15');
      });
    });

    it('should return empty array when no transactions on date', () => {
      const result = service.getByDate(new Date('2024-01-20'));

      expect(result).toEqual([]);
    });

    it('should match date regardless of time', () => {
      service.create(
        createTestInput({
          date: new Date('2024-01-17T09:30:00'),
          amount: 1000,
        })
      );
      service.create(
        createTestInput({
          date: new Date('2024-01-17T18:45:00'),
          amount: 2000,
        })
      );

      const result = service.getByDate(new Date('2024-01-17'));

      expect(result).toHaveLength(2);
    });
  });

  describe('getDailySummaries', () => {
    beforeEach(() => {
      // 1월 15일: 수입 100,000, 지출 30,000
      service.create(
        createTestInput({
          type: 'income',
          amount: 100000,
          date: new Date('2024-01-15'),
        })
      );
      service.create(
        createTestInput({
          type: 'expense',
          amount: 20000,
          date: new Date('2024-01-15'),
        })
      );
      service.create(
        createTestInput({
          type: 'expense',
          amount: 10000,
          date: new Date('2024-01-15'),
        })
      );

      // 1월 20일: 지출 15,000
      service.create(
        createTestInput({
          type: 'expense',
          amount: 15000,
          date: new Date('2024-01-20'),
        })
      );

      // 2월 5일: 수입 50,000 (다른 달)
      service.create(
        createTestInput({
          type: 'income',
          amount: 50000,
          date: new Date('2024-02-05'),
        })
      );
    });

    it('should return daily summaries for specified month', () => {
      const result = service.getDailySummaries(2024, 1);

      expect(result).toHaveLength(2); // 1월 15일, 1월 20일
    });

    it('should calculate correct totals for each day', () => {
      const result = service.getDailySummaries(2024, 1);

      const jan15 = result.find((s) => s.date === '2024-01-15');
      expect(jan15).toBeDefined();
      expect(jan15!.totalIncome).toBe(100000);
      expect(jan15!.totalExpense).toBe(30000);
      expect(jan15!.balance).toBe(70000);
      expect(jan15!.transactionCount).toBe(3);
    });

    it('should handle days with only expenses', () => {
      const result = service.getDailySummaries(2024, 1);

      const jan20 = result.find((s) => s.date === '2024-01-20');
      expect(jan20).toBeDefined();
      expect(jan20!.totalIncome).toBe(0);
      expect(jan20!.totalExpense).toBe(15000);
      expect(jan20!.balance).toBe(-15000);
      expect(jan20!.transactionCount).toBe(1);
    });

    it('should return empty array when no transactions in month', () => {
      const result = service.getDailySummaries(2024, 3);

      expect(result).toEqual([]);
    });

    it('should not include transactions from other months', () => {
      const result = service.getDailySummaries(2024, 2);

      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2024-02-05');
    });

    it('should sort summaries by date', () => {
      const result = service.getDailySummaries(2024, 1);

      expect(result[0].date).toBe('2024-01-15');
      expect(result[1].date).toBe('2024-01-20');
    });
  });

  describe('getMonthlySummary', () => {
    it('should return zeros when no transactions in month', () => {
      const result = service.getMonthlySummary(2024, 3);

      expect(result).toEqual({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        transactionCount: 0,
      });
    });

    it('should return correct summary for a month with transactions', () => {
      service.create(
        createTestInput({
          type: 'income',
          amount: 100000,
          date: new Date('2024-01-10'),
        })
      );
      service.create(
        createTestInput({
          type: 'expense',
          amount: 30000,
          date: new Date('2024-01-15'),
        })
      );
      service.create(
        createTestInput({
          type: 'expense',
          amount: 20000,
          date: new Date('2024-01-20'),
        })
      );

      const result = service.getMonthlySummary(2024, 1);

      expect(result.totalIncome).toBe(100000);
      expect(result.totalExpense).toBe(50000);
      expect(result.balance).toBe(50000);
      expect(result.transactionCount).toBe(3);
    });

    it('should exclude transactions from other months', () => {
      service.create(
        createTestInput({
          type: 'income',
          amount: 100000,
          date: new Date('2024-01-15'),
        })
      );
      service.create(
        createTestInput({
          type: 'expense',
          amount: 50000,
          date: new Date('2024-02-10'),
        })
      );

      const result = service.getMonthlySummary(2024, 1);

      expect(result.totalIncome).toBe(100000);
      expect(result.totalExpense).toBe(0);
      expect(result.transactionCount).toBe(1);
    });
  });

  describe('getYearlySummary', () => {
    it('should return zeros when no transactions in year', () => {
      const result = service.getYearlySummary(2025);

      expect(result).toEqual({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        transactionCount: 0,
      });
    });

    it('should aggregate transactions across multiple months', () => {
      service.create(
        createTestInput({
          type: 'income',
          amount: 100000,
          date: new Date('2024-01-15'),
        })
      );
      service.create(
        createTestInput({
          type: 'expense',
          amount: 30000,
          date: new Date('2024-03-10'),
        })
      );
      service.create(
        createTestInput({
          type: 'income',
          amount: 200000,
          date: new Date('2024-06-20'),
        })
      );
      service.create(
        createTestInput({
          type: 'expense',
          amount: 50000,
          date: new Date('2024-12-01'),
        })
      );

      const result = service.getYearlySummary(2024);

      expect(result.totalIncome).toBe(300000);
      expect(result.totalExpense).toBe(80000);
      expect(result.balance).toBe(220000);
      expect(result.transactionCount).toBe(4);
    });

    it('should exclude transactions from other years', () => {
      service.create(
        createTestInput({
          type: 'income',
          amount: 100000,
          date: new Date('2024-06-15'),
        })
      );
      service.create(
        createTestInput({
          type: 'expense',
          amount: 50000,
          date: new Date('2023-06-15'),
        })
      );

      const result = service.getYearlySummary(2024);

      expect(result.totalIncome).toBe(100000);
      expect(result.totalExpense).toBe(0);
      expect(result.transactionCount).toBe(1);
    });
  });

  describe('getCategoryBreakdown', () => {
    it('should return empty array when no transactions in range', () => {
      const result = service.getCategoryBreakdown(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(result).toEqual([]);
    });

    it('should return category breakdown with correct percentages', () => {
      service.create(
        createTestInput({
          type: 'expense',
          amount: 60000,
          categoryId: 'food',
          date: new Date('2024-01-10'),
        })
      );
      service.create(
        createTestInput({
          type: 'expense',
          amount: 30000,
          categoryId: 'transport',
          date: new Date('2024-01-15'),
        })
      );
      service.create(
        createTestInput({
          type: 'expense',
          amount: 10000,
          categoryId: 'food',
          date: new Date('2024-01-20'),
        })
      );

      const result = service.getCategoryBreakdown(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(result).toHaveLength(2);
      // food: 70000 (70%), transport: 30000 (30%)
      expect(result[0].categoryId).toBe('food');
      expect(result[0].amount).toBe(70000);
      expect(result[0].percentage).toBe(70);
      expect(result[0].transactionCount).toBe(2);

      expect(result[1].categoryId).toBe('transport');
      expect(result[1].amount).toBe(30000);
      expect(result[1].percentage).toBe(30);
      expect(result[1].transactionCount).toBe(1);
    });

    it('should sort by amount descending', () => {
      service.create(
        createTestInput({
          type: 'expense',
          amount: 10000,
          categoryId: 'misc',
          date: new Date('2024-01-05'),
        })
      );
      service.create(
        createTestInput({
          type: 'expense',
          amount: 50000,
          categoryId: 'food',
          date: new Date('2024-01-10'),
        })
      );
      service.create(
        createTestInput({
          type: 'expense',
          amount: 30000,
          categoryId: 'transport',
          date: new Date('2024-01-15'),
        })
      );

      const result = service.getCategoryBreakdown(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(result[0].categoryId).toBe('food');
      expect(result[1].categoryId).toBe('transport');
      expect(result[2].categoryId).toBe('misc');
    });

    it('should filter by type when provided', () => {
      service.create(
        createTestInput({
          type: 'income',
          amount: 100000,
          categoryId: 'salary',
          date: new Date('2024-01-10'),
        })
      );
      service.create(
        createTestInput({
          type: 'expense',
          amount: 30000,
          categoryId: 'food',
          date: new Date('2024-01-15'),
        })
      );

      const expenseResult = service.getCategoryBreakdown(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        'expense'
      );

      expect(expenseResult).toHaveLength(1);
      expect(expenseResult[0].categoryId).toBe('food');
      expect(expenseResult[0].percentage).toBe(100);

      const incomeResult = service.getCategoryBreakdown(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        'income'
      );

      expect(incomeResult).toHaveLength(1);
      expect(incomeResult[0].categoryId).toBe('salary');
      expect(incomeResult[0].percentage).toBe(100);
    });

    it('should include all types when type filter is not provided', () => {
      service.create(
        createTestInput({
          type: 'income',
          amount: 100000,
          categoryId: 'salary',
          date: new Date('2024-01-10'),
        })
      );
      service.create(
        createTestInput({
          type: 'expense',
          amount: 50000,
          categoryId: 'food',
          date: new Date('2024-01-15'),
        })
      );

      const result = service.getCategoryBreakdown(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(result).toHaveLength(2);
      // percentages should sum to 100 (rounding)
      const totalPercentage = result.reduce((sum, r) => sum + r.percentage, 0);
      expect(totalPercentage).toBeCloseTo(100, 0);
    });
  });

  describe('getPaymentMethodBreakdown', () => {
    it('should return empty array when no transactions in range', () => {
      const result = service.getPaymentMethodBreakdown(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(result).toEqual([]);
    });

    it('should return payment method breakdown with correct percentages', () => {
      service.create(
        createTestInput({
          type: 'expense',
          amount: 80000,
          paymentMethodId: 'card',
          date: new Date('2024-01-10'),
        })
      );
      service.create(
        createTestInput({
          type: 'expense',
          amount: 20000,
          paymentMethodId: 'cash',
          date: new Date('2024-01-15'),
        })
      );

      const result = service.getPaymentMethodBreakdown(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(result).toHaveLength(2);
      expect(result[0].paymentMethodId).toBe('card');
      expect(result[0].amount).toBe(80000);
      expect(result[0].percentage).toBe(80);
      expect(result[0].transactionCount).toBe(1);

      expect(result[1].paymentMethodId).toBe('cash');
      expect(result[1].amount).toBe(20000);
      expect(result[1].percentage).toBe(20);
      expect(result[1].transactionCount).toBe(1);
    });

    it('should sort by amount descending', () => {
      service.create(
        createTestInput({
          type: 'expense',
          amount: 10000,
          paymentMethodId: 'cash',
          date: new Date('2024-01-05'),
        })
      );
      service.create(
        createTestInput({
          type: 'expense',
          amount: 50000,
          paymentMethodId: 'card',
          date: new Date('2024-01-10'),
        })
      );
      service.create(
        createTestInput({
          type: 'expense',
          amount: 30000,
          paymentMethodId: 'transfer',
          date: new Date('2024-01-15'),
        })
      );

      const result = service.getPaymentMethodBreakdown(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(result[0].paymentMethodId).toBe('card');
      expect(result[1].paymentMethodId).toBe('transfer');
      expect(result[2].paymentMethodId).toBe('cash');
    });

    it('should filter by type when provided', () => {
      service.create(
        createTestInput({
          type: 'income',
          amount: 100000,
          paymentMethodId: 'transfer',
          date: new Date('2024-01-10'),
        })
      );
      service.create(
        createTestInput({
          type: 'expense',
          amount: 30000,
          paymentMethodId: 'card',
          date: new Date('2024-01-15'),
        })
      );

      const result = service.getPaymentMethodBreakdown(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        'expense'
      );

      expect(result).toHaveLength(1);
      expect(result[0].paymentMethodId).toBe('card');
      expect(result[0].percentage).toBe(100);
    });
  });
});
