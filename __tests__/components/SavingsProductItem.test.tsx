import React from 'react';
import { render, screen, fireEvent } from '../test-utils';
import SavingsProductItem from '../../src/views/components/SavingsProductItem';
import { SavingsProduct } from '../../src/types';

describe('SavingsProductItem', () => {
  const mockOnDelete = jest.fn();

  const createMockProduct = (
    overrides: Partial<SavingsProduct> = {}
  ): SavingsProduct => ({
    id: 'savings-1',
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
    mockOnDelete.mockClear();
  });

  describe('rendering', () => {
    it('should render product name', () => {
      render(
        <SavingsProductItem
          product={createMockProduct()}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('청년적금')).toBeTruthy();
    });

    it('should render active status badge as 운용중', () => {
      render(
        <SavingsProductItem
          product={createMockProduct({ status: 'active' })}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('운용중')).toBeTruthy();
    });

    it('should render pending status badge as 대기', () => {
      render(
        <SavingsProductItem
          product={createMockProduct({ status: 'pending' })}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('대기')).toBeTruthy();
    });

    it('should render bank name', () => {
      render(
        <SavingsProductItem
          product={createMockProduct({ bank: '신한은행' })}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('신한은행')).toBeTruthy();
    });

    it('should render interest rate with percentage', () => {
      render(
        <SavingsProductItem
          product={createMockProduct({ interestRate: 4.5 })}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('4.5%')).toBeTruthy();
    });

    it('should render formatted monthly amount', () => {
      render(
        <SavingsProductItem
          product={createMockProduct({ monthlyAmount: 300000 })}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('300,000원')).toBeTruthy();
    });

    it('should render paid months', () => {
      render(
        <SavingsProductItem
          product={createMockProduct({ paidMonths: 6 })}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('6개월')).toBeTruthy();
    });

    it('should render formatted current amount', () => {
      render(
        <SavingsProductItem
          product={createMockProduct({ currentAmount: 1800000 })}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('1,800,000원')).toBeTruthy();
    });

    it('should render memo when provided', () => {
      render(
        <SavingsProductItem
          product={createMockProduct({ memo: '청년 우대 적금' })}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('청년 우대 적금')).toBeTruthy();
    });

    it('should not render memo when not provided', () => {
      render(
        <SavingsProductItem
          product={createMockProduct({ memo: undefined })}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText('청년 우대 적금')).toBeNull();
    });

    it('should render delete button', () => {
      render(
        <SavingsProductItem
          product={createMockProduct()}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('삭제')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onDelete with id and name when delete button is pressed', () => {
      render(
        <SavingsProductItem
          product={createMockProduct({ id: 'savings-test', name: '테스트적금' })}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.press(screen.getByText('삭제'));

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).toHaveBeenCalledWith('savings-test', '테스트적금');
    });
  });
});
