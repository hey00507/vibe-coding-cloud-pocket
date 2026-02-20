import React from 'react';
import { render, screen } from '@testing-library/react-native';
import SummaryCard from '../../src/views/components/SummaryCard';

describe('SummaryCard', () => {
  describe('rendering', () => {
    it('should render balance label', () => {
      render(
        <SummaryCard balance={0} totalIncome={0} totalExpense={0} />
      );

      expect(screen.getByText('잔액')).toBeTruthy();
    });

    it('should render income and expense labels', () => {
      render(
        <SummaryCard balance={0} totalIncome={0} totalExpense={0} />
      );

      expect(screen.getByText('수입')).toBeTruthy();
      expect(screen.getByText('지출')).toBeTruthy();
    });
  });

  describe('balance display', () => {
    it('should display formatted positive balance', () => {
      render(
        <SummaryCard balance={50000} totalIncome={100000} totalExpense={50000} />
      );

      expect(screen.getByText('50,000원')).toBeTruthy();
    });

    it('should display formatted negative balance', () => {
      render(
        <SummaryCard balance={-30000} totalIncome={20000} totalExpense={50000} />
      );

      expect(screen.getByText('-30,000원')).toBeTruthy();
    });

    it('should display zero balance', () => {
      render(
        <SummaryCard balance={0} totalIncome={0} totalExpense={0} />
      );

      expect(screen.getByText('0원')).toBeTruthy();
    });

    it('should display large balance with comma formatting', () => {
      render(
        <SummaryCard
          balance={1234567}
          totalIncome={2000000}
          totalExpense={765433}
        />
      );

      expect(screen.getByText('1,234,567원')).toBeTruthy();
    });
  });

  describe('income and expense display', () => {
    it('should display formatted income with plus sign', () => {
      render(
        <SummaryCard balance={50000} totalIncome={100000} totalExpense={50000} />
      );

      expect(screen.getByText('+100,000원')).toBeTruthy();
    });

    it('should display formatted expense with minus sign', () => {
      render(
        <SummaryCard balance={50000} totalIncome={100000} totalExpense={50000} />
      );

      expect(screen.getByText('-50,000원')).toBeTruthy();
    });

    it('should display zero income and expense', () => {
      render(
        <SummaryCard balance={0} totalIncome={0} totalExpense={0} />
      );

      expect(screen.getByText('+0원')).toBeTruthy();
      expect(screen.getByText('-0원')).toBeTruthy();
    });
  });

  describe('extended savings section', () => {
    it('should show savings section when totalSavings > 0', () => {
      render(
        <SummaryCard
          balance={2000000}
          totalIncome={3000000}
          totalExpense={1000000}
          totalSavings={500000}
          savingsRate={17}
          remainingCash={1500000}
        />
      );

      expect(screen.getByText('저축')).toBeTruthy();
      expect(screen.getByText('500,000원')).toBeTruthy();
    });

    it('should show savings rate when provided', () => {
      render(
        <SummaryCard
          balance={2000000}
          totalIncome={3000000}
          totalExpense={1000000}
          totalSavings={600000}
          savingsRate={20}
          remainingCash={1400000}
        />
      );

      expect(screen.getByText('저축률')).toBeTruthy();
      expect(screen.getByText('20%')).toBeTruthy();
    });

    it('should show remaining cash when provided', () => {
      render(
        <SummaryCard
          balance={1500000}
          totalIncome={3000000}
          totalExpense={1500000}
          totalSavings={500000}
          savingsRate={17}
          remainingCash={1000000}
        />
      );

      expect(screen.getByText('잔여현금')).toBeTruthy();
      expect(screen.getByText('1,000,000원')).toBeTruthy();
    });

    it('should not show extended section when totalSavings is 0', () => {
      render(
        <SummaryCard
          balance={2000000}
          totalIncome={3000000}
          totalExpense={1000000}
          totalSavings={0}
        />
      );

      expect(screen.queryByText('저축')).toBeNull();
      expect(screen.queryByText('저축률')).toBeNull();
      expect(screen.queryByText('잔여현금')).toBeNull();
    });

    it('should not show extended section when totalSavings is undefined', () => {
      render(
        <SummaryCard balance={2000000} totalIncome={3000000} totalExpense={1000000} />
      );

      expect(screen.queryByText('저축')).toBeNull();
    });

    it('should show negative remaining cash in expense color', () => {
      render(
        <SummaryCard
          balance={200000}
          totalIncome={1000000}
          totalExpense={800000}
          totalSavings={500000}
          savingsRate={50}
          remainingCash={-300000}
        />
      );

      expect(screen.getByText('잔여현금')).toBeTruthy();
      expect(screen.getByText('-300,000원')).toBeTruthy();
    });
  });
});
