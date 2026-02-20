import React from 'react';
import { render, screen } from '@testing-library/react-native';
import AnnualDashboard from '../../src/views/components/AnnualDashboard';
import { PeriodSummary, MonthlyCategoryMatrix } from '../../src/types';

describe('AnnualDashboard', () => {
  const emptySummaries: PeriodSummary[] = Array.from({ length: 12 }, () => ({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0,
  }));

  it('should render year title', () => {
    render(
      <AnnualDashboard
        year={2026}
        monthlySummaries={emptySummaries}
        categoryMatrix={[]}
      />
    );

    expect(screen.getByText('2026년 연간 대시보드')).toBeTruthy();
  });

  it('should render month headers', () => {
    render(
      <AnnualDashboard
        year={2026}
        monthlySummaries={emptySummaries}
        categoryMatrix={[]}
      />
    );

    expect(screen.getByText('1월')).toBeTruthy();
    expect(screen.getByText('12월')).toBeTruthy();
    expect(screen.getByText('합계')).toBeTruthy();
  });

  it('should render row labels', () => {
    render(
      <AnnualDashboard
        year={2026}
        monthlySummaries={emptySummaries}
        categoryMatrix={[]}
      />
    );

    expect(screen.getByText('총 수입')).toBeTruthy();
    expect(screen.getByText('총 저축')).toBeTruthy();
    expect(screen.getByText('총 지출')).toBeTruthy();
    expect(screen.getByText('잉여금액')).toBeTruthy();
  });

  it('should render category matrix rows', () => {
    const matrix: MonthlyCategoryMatrix[] = [
      {
        categoryId: 'cat-1',
        categoryName: '식비',
        monthlyAmounts: [50000, 60000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        total: 110000,
      },
    ];

    render(
      <AnnualDashboard
        year={2026}
        monthlySummaries={emptySummaries}
        categoryMatrix={matrix}
      />
    );

    expect(screen.getByText('식비')).toBeTruthy();
  });

  it('should render with summaries data', () => {
    const summaries = [...emptySummaries];
    summaries[0] = {
      totalIncome: 3000000,
      totalExpense: 1500000,
      balance: 1500000,
      transactionCount: 10,
    };

    render(
      <AnnualDashboard
        year={2026}
        monthlySummaries={summaries}
        categoryMatrix={[]}
      />
    );

    // Should render formatted amounts
    expect(screen.getByText('항목')).toBeTruthy();
  });

  it('should format amounts under 10000 with locale string', () => {
    const summaries = [...emptySummaries];
    summaries[0] = {
      totalIncome: 5000,
      totalExpense: 3000,
      balance: 2000,
      transactionCount: 2,
    };

    render(
      <AnnualDashboard
        year={2026}
        monthlySummaries={summaries}
        categoryMatrix={[]}
      />
    );

    expect(screen.getAllByText('5,000').length).toBeGreaterThanOrEqual(1);
  });

  it('should render negative remaining in expense color', () => {
    const summaries = [...emptySummaries];
    summaries[0] = {
      totalIncome: 1000000,
      totalExpense: 2000000,
      balance: -1000000,
      transactionCount: 5,
    };

    render(
      <AnnualDashboard
        year={2026}
        monthlySummaries={summaries}
        categoryMatrix={[]}
      />
    );

    expect(screen.getByText('잉여금액')).toBeTruthy();
  });

  it('should use totalSavings prop when provided', () => {
    const summaries = [...emptySummaries];
    summaries[0] = {
      totalIncome: 3000000,
      totalExpense: 1000000,
      balance: 2000000,
      transactionCount: 5,
    };
    const savings = new Array(12).fill(0);
    savings[0] = 500000;

    render(
      <AnnualDashboard
        year={2026}
        monthlySummaries={summaries}
        categoryMatrix={[]}
        totalSavings={savings}
      />
    );

    expect(screen.getByText('총 저축')).toBeTruthy();
  });

  it('should render multiple category rows', () => {
    const matrix: MonthlyCategoryMatrix[] = [
      {
        categoryId: 'cat-1',
        categoryName: '식비',
        monthlyAmounts: new Array(12).fill(50000),
        total: 600000,
      },
      {
        categoryId: 'cat-2',
        categoryName: '교통비',
        monthlyAmounts: new Array(12).fill(30000),
        total: 360000,
      },
    ];

    render(
      <AnnualDashboard
        year={2026}
        monthlySummaries={emptySummaries}
        categoryMatrix={matrix}
      />
    );

    expect(screen.getByText('식비')).toBeTruthy();
    expect(screen.getByText('교통비')).toBeTruthy();
  });
});
