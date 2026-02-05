import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import TransactionItem from '../../src/views/components/TransactionItem';
import { Transaction } from '../../src/types';

describe('TransactionItem', () => {
  const mockOnDelete = jest.fn();

  const createMockTransaction = (
    overrides: Partial<Transaction> = {}
  ): Transaction => ({
    id: 'test-id',
    type: 'expense',
    amount: 15000,
    date: new Date('2024-01-15'),
    categoryId: 'category-1',
    paymentMethodId: 'payment-1',
    memo: '테스트 메모',
    ...overrides,
  });

  beforeEach(() => {
    mockOnDelete.mockClear();
  });

  describe('rendering', () => {
    it('should render category name', () => {
      render(
        <TransactionItem
          transaction={createMockTransaction()}
          categoryName="식비"
          paymentMethodName="신용카드"
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('식비')).toBeTruthy();
    });

    it('should render payment method name', () => {
      render(
        <TransactionItem
          transaction={createMockTransaction()}
          categoryName="식비"
          paymentMethodName="신용카드"
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('신용카드')).toBeTruthy();
    });

    it('should render memo when provided', () => {
      render(
        <TransactionItem
          transaction={createMockTransaction({ memo: '점심 식사' })}
          categoryName="식비"
          paymentMethodName="신용카드"
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('점심 식사')).toBeTruthy();
    });

    it('should not render memo when not provided', () => {
      render(
        <TransactionItem
          transaction={createMockTransaction({ memo: undefined })}
          categoryName="식비"
          paymentMethodName="신용카드"
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText('테스트 메모')).toBeNull();
    });

    it('should render delete button', () => {
      render(
        <TransactionItem
          transaction={createMockTransaction()}
          categoryName="식비"
          paymentMethodName="신용카드"
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('삭제')).toBeTruthy();
    });
  });

  describe('amount display', () => {
    it('should display expense amount with minus sign', () => {
      render(
        <TransactionItem
          transaction={createMockTransaction({ type: 'expense', amount: 15000 })}
          categoryName="식비"
          paymentMethodName="신용카드"
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('-15,000원')).toBeTruthy();
    });

    it('should display income amount with plus sign', () => {
      render(
        <TransactionItem
          transaction={createMockTransaction({ type: 'income', amount: 3000000 })}
          categoryName="급여"
          paymentMethodName="계좌이체"
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('+3,000,000원')).toBeTruthy();
    });

    it('should format large amounts with commas', () => {
      render(
        <TransactionItem
          transaction={createMockTransaction({ type: 'expense', amount: 1234567 })}
          categoryName="식비"
          paymentMethodName="신용카드"
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('-1,234,567원')).toBeTruthy();
    });
  });

  describe('date display', () => {
    it('should display formatted date', () => {
      render(
        <TransactionItem
          transaction={createMockTransaction({ date: new Date('2024-01-15') })}
          categoryName="식비"
          paymentMethodName="신용카드"
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('1/15')).toBeTruthy();
    });

    it('should display date for different months', () => {
      render(
        <TransactionItem
          transaction={createMockTransaction({ date: new Date('2024-12-25') })}
          categoryName="식비"
          paymentMethodName="신용카드"
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('12/25')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onDelete when delete button is pressed', () => {
      render(
        <TransactionItem
          transaction={createMockTransaction()}
          categoryName="식비"
          paymentMethodName="신용카드"
          onDelete={mockOnDelete}
        />
      );

      fireEvent.press(screen.getByText('삭제'));

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });
});
