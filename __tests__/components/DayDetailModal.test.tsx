import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import DayDetailModal from '../../src/views/components/DayDetailModal';
import { Transaction, Category, PaymentMethod } from '../../src/types';

describe('DayDetailModal', () => {
  const mockOnClose = jest.fn();

  const categories: Category[] = [
    { id: 'cat-1', name: '식비', type: 'expense', icon: '🍔' },
    { id: 'cat-2', name: '급여', type: 'income', icon: '💰' },
  ];

  const paymentMethods: PaymentMethod[] = [
    { id: 'pm-1', name: '신용카드', icon: '💳' },
  ];

  const transactions: Transaction[] = [
    {
      id: 'tx-1',
      type: 'expense',
      amount: 15000,
      date: new Date('2024-01-15'),
      categoryId: 'cat-1',
      paymentMethodId: 'pm-1',
      memo: '점심 식사',
    },
    {
      id: 'tx-2',
      type: 'income',
      amount: 100000,
      date: new Date('2024-01-15'),
      categoryId: 'cat-2',
      paymentMethodId: 'pm-1',
    },
  ];

  const defaultProps = {
    visible: true,
    date: new Date('2024-01-15'),
    transactions,
    categories,
    paymentMethods,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  describe('rendering', () => {
    it('should render date header', () => {
      render(<DayDetailModal {...defaultProps} />);

      expect(screen.getByText('1월 15일 (월)')).toBeTruthy();
    });

    it('should render transactions', () => {
      render(<DayDetailModal {...defaultProps} />);

      expect(screen.getByText('식비')).toBeTruthy();
      expect(screen.getByText('급여')).toBeTruthy();
    });

    it('should render transaction amounts', () => {
      render(<DayDetailModal {...defaultProps} />);

      expect(screen.getByText('-15,000원')).toBeTruthy();
      expect(screen.getByText('+100,000원')).toBeTruthy();
    });

    it('should render payment method', () => {
      render(<DayDetailModal {...defaultProps} />);

      // 신용카드가 여러 번 나타남
      expect(screen.getAllByText('신용카드').length).toBeGreaterThanOrEqual(1);
    });

    it('should render memo when provided', () => {
      render(<DayDetailModal {...defaultProps} />);

      expect(screen.getByText('점심 식사')).toBeTruthy();
    });

    it('should render daily total', () => {
      render(<DayDetailModal {...defaultProps} />);

      // 100000 - 15000 = 85000
      expect(screen.getByText('+85,000원')).toBeTruthy();
    });

    it('should render empty state when no transactions', () => {
      render(<DayDetailModal {...defaultProps} transactions={[]} />);

      expect(screen.getByText('거래 내역이 없습니다')).toBeTruthy();
    });

    it('should not render when date is null', () => {
      const { toJSON } = render(<DayDetailModal {...defaultProps} date={null} />);

      expect(toJSON()).toBeNull();
    });
  });

  describe('interactions', () => {
    it('should call onClose when close button is pressed', () => {
      render(<DayDetailModal {...defaultProps} />);

      fireEvent.press(screen.getByText('✕'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should handle unknown category', () => {
      const txWithUnknownCategory: Transaction[] = [
        {
          id: 'tx-unknown',
          type: 'expense',
          amount: 5000,
          date: new Date('2024-01-15'),
          categoryId: 'unknown-cat',
          paymentMethodId: 'pm-1',
        },
      ];

      render(
        <DayDetailModal
          {...defaultProps}
          transactions={txWithUnknownCategory}
        />
      );

      expect(screen.getByText('기타')).toBeTruthy();
    });

    it('should handle unknown payment method', () => {
      const txWithUnknownPM: Transaction[] = [
        {
          id: 'tx-unknown-pm',
          type: 'expense',
          amount: 5000,
          date: new Date('2024-01-15'),
          categoryId: 'cat-1',
          paymentMethodId: 'unknown-pm',
        },
      ];

      render(
        <DayDetailModal {...defaultProps} transactions={txWithUnknownPM} />
      );

      // 기타가 결제수단으로 표시
      expect(screen.getAllByText('기타').length).toBeGreaterThanOrEqual(1);
    });

    it('should handle income transaction', () => {
      const incomeOnly: Transaction[] = [
        {
          id: 'tx-income',
          type: 'income',
          amount: 50000,
          date: new Date('2024-01-15'),
          categoryId: 'cat-2',
          paymentMethodId: 'pm-1',
        },
      ];

      render(<DayDetailModal {...defaultProps} transactions={incomeOnly} />);

      // 같은 금액이 거래 항목과 일일 합계에 표시됨
      expect(screen.getAllByText('+50,000원').length).toBeGreaterThanOrEqual(1);
    });

    it('should handle negative daily balance', () => {
      const expenseOnly: Transaction[] = [
        {
          id: 'tx-exp',
          type: 'expense',
          amount: 30000,
          date: new Date('2024-01-15'),
          categoryId: 'cat-1',
          paymentMethodId: 'pm-1',
        },
      ];

      render(<DayDetailModal {...defaultProps} transactions={expenseOnly} />);

      // 같은 금액이 거래 항목과 일일 합계에 표시됨
      expect(screen.getAllByText('-30,000원').length).toBeGreaterThanOrEqual(1);
    });

    it('should render category icon when available', () => {
      render(<DayDetailModal {...defaultProps} />);

      expect(screen.getByText('🍔')).toBeTruthy();
      expect(screen.getByText('💰')).toBeTruthy();
    });

    it('should not render daily total when no transactions', () => {
      render(<DayDetailModal {...defaultProps} transactions={[]} />);

      expect(screen.queryByText('일일 합계')).toBeNull();
    });
  });
});
