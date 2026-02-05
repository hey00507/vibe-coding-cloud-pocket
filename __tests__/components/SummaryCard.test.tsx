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
});
