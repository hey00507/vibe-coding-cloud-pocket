import React from 'react';
import { render, screen } from '@testing-library/react-native';
import SavingsSummaryCard from '../../src/views/components/SavingsSummaryCard';

describe('SavingsSummaryCard', () => {
  describe('rendering', () => {
    it('should render the title', () => {
      render(
        <SavingsSummaryCard
          totalSavings={0}
          monthlySavingsTarget={0}
          activeProductCount={0}
        />
      );

      expect(screen.getByText('저축 현황')).toBeTruthy();
    });

    it('should render total savings label', () => {
      render(
        <SavingsSummaryCard
          totalSavings={0}
          monthlySavingsTarget={0}
          activeProductCount={0}
        />
      );

      expect(screen.getByText('총 저축액')).toBeTruthy();
    });

    it('should render monthly savings target label', () => {
      render(
        <SavingsSummaryCard
          totalSavings={0}
          monthlySavingsTarget={0}
          activeProductCount={0}
        />
      );

      expect(screen.getByText('월 저축 목표')).toBeTruthy();
    });

    it('should render active product count label', () => {
      render(
        <SavingsSummaryCard
          totalSavings={0}
          monthlySavingsTarget={0}
          activeProductCount={0}
        />
      );

      expect(screen.getByText('운용 상품 수')).toBeTruthy();
    });
  });

  describe('amount display', () => {
    it('should display formatted total savings', () => {
      render(
        <SavingsSummaryCard
          totalSavings={5000000}
          monthlySavingsTarget={0}
          activeProductCount={0}
        />
      );

      expect(screen.getByText('5,000,000원')).toBeTruthy();
    });

    it('should display formatted monthly savings target', () => {
      render(
        <SavingsSummaryCard
          totalSavings={0}
          monthlySavingsTarget={800000}
          activeProductCount={0}
        />
      );

      expect(screen.getByText('800,000원')).toBeTruthy();
    });

    it('should display active product count with 개 suffix', () => {
      render(
        <SavingsSummaryCard
          totalSavings={0}
          monthlySavingsTarget={0}
          activeProductCount={3}
        />
      );

      expect(screen.getByText('3개')).toBeTruthy();
    });

    it('should display zero values correctly', () => {
      render(
        <SavingsSummaryCard
          totalSavings={0}
          monthlySavingsTarget={0}
          activeProductCount={0}
        />
      );

      expect(screen.getAllByText('0원')).toHaveLength(2);
      expect(screen.getByText('0개')).toBeTruthy();
    });

    it('should display large amounts with comma formatting', () => {
      render(
        <SavingsSummaryCard
          totalSavings={12345678}
          monthlySavingsTarget={1500000}
          activeProductCount={5}
        />
      );

      expect(screen.getByText('12,345,678원')).toBeTruthy();
      expect(screen.getByText('1,500,000원')).toBeTruthy();
      expect(screen.getByText('5개')).toBeTruthy();
    });
  });
});
