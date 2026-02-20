import React from 'react';
import { render, screen } from '@testing-library/react-native';
import GroupedBarChart, {
  MonthlyBarData,
} from '../../src/views/components/GroupedBarChart';

const sampleData: MonthlyBarData[] = [
  { month: 1, label: '1월', income: 300000, savings: 100000, expense: 150000 },
  { month: 2, label: '2월', income: 350000, savings: 100000, expense: 200000 },
  { month: 3, label: '3월', income: 300000, savings: 50000, expense: 180000 },
];

const fullYearData: MonthlyBarData[] = Array.from({ length: 12 }, (_, i) => ({
  month: i + 1,
  label: `${i + 1}월`,
  income: 300000,
  savings: 100000,
  expense: 150000 + i * 10000,
}));

const emptyData: MonthlyBarData[] = [
  { month: 1, label: '1월', income: 0, savings: 0, expense: 0 },
  { month: 2, label: '2월', income: 0, savings: 0, expense: 0 },
];

describe('GroupedBarChart', () => {
  describe('empty state', () => {
    it('should render empty state when all values are 0', () => {
      render(<GroupedBarChart data={emptyData} />);
      expect(screen.getByText('데이터가 없습니다')).toBeTruthy();
    });

    it('should render empty state for empty array', () => {
      render(<GroupedBarChart data={[]} />);
      expect(screen.getByText('데이터가 없습니다')).toBeTruthy();
    });
  });

  describe('rendering with data', () => {
    it('should render SVG container', () => {
      render(<GroupedBarChart data={sampleData} />);
      expect(screen.getByTestId('bar-chart-svg')).toBeTruthy();
    });

    it('should render month labels', () => {
      render(<GroupedBarChart data={sampleData} />);
      expect(screen.getByText('1월')).toBeTruthy();
      expect(screen.getByText('2월')).toBeTruthy();
      expect(screen.getByText('3월')).toBeTruthy();
    });

    it('should render bars for each month', () => {
      render(<GroupedBarChart data={sampleData} />);
      expect(screen.getByTestId('bar-income-0')).toBeTruthy();
      expect(screen.getByTestId('bar-savings-0')).toBeTruthy();
      expect(screen.getByTestId('bar-expense-0')).toBeTruthy();
    });

    it('should render all 12 months when full year data provided', () => {
      render(<GroupedBarChart data={fullYearData} />);
      for (let i = 0; i < 12; i++) {
        expect(screen.getByTestId(`bar-income-${i}`)).toBeTruthy();
      }
    });
  });

  describe('legend', () => {
    it('should render 3 legend items', () => {
      render(<GroupedBarChart data={sampleData} />);
      expect(screen.getByText('수입')).toBeTruthy();
      expect(screen.getByText('저축')).toBeTruthy();
      expect(screen.getByText('지출')).toBeTruthy();
    });

    it('should render legend color indicators', () => {
      render(<GroupedBarChart data={sampleData} />);
      expect(screen.getByTestId('legend-income')).toBeTruthy();
      expect(screen.getByTestId('legend-savings')).toBeTruthy();
      expect(screen.getByTestId('legend-expense')).toBeTruthy();
    });
  });

  describe('colors', () => {
    it('should use default colors', () => {
      render(<GroupedBarChart data={sampleData} />);
      const incomeBar = screen.getByTestId('bar-income-0');
      expect(incomeBar.props.fill).toBe('#4CAF50');
      const savingsBar = screen.getByTestId('bar-savings-0');
      expect(savingsBar.props.fill).toBe('#2196F3');
      const expenseBar = screen.getByTestId('bar-expense-0');
      expect(expenseBar.props.fill).toBe('#F44336');
    });

    it('should use custom colors when provided', () => {
      const customColors = {
        income: '#00FF00',
        savings: '#0000FF',
        expense: '#FF0000',
      };
      render(<GroupedBarChart data={sampleData} barColors={customColors} />);
      const incomeBar = screen.getByTestId('bar-income-0');
      expect(incomeBar.props.fill).toBe('#00FF00');
    });
  });

  describe('props', () => {
    it('should use default height', () => {
      render(<GroupedBarChart data={sampleData} />);
      const svg = screen.getByTestId('bar-chart-svg');
      expect(svg.props.height).toBe(200);
    });

    it('should use custom height when provided', () => {
      render(<GroupedBarChart data={sampleData} height={300} />);
      const svg = screen.getByTestId('bar-chart-svg');
      expect(svg.props.height).toBe(300);
    });
  });

  describe('scaling', () => {
    it('should have bar height proportional to value', () => {
      const data: MonthlyBarData[] = [
        { month: 1, label: '1월', income: 100000, savings: 50000, expense: 25000 },
      ];
      render(<GroupedBarChart data={data} height={200} />);
      const incomeBar = screen.getByTestId('bar-income-0');
      const expenseBar = screen.getByTestId('bar-expense-0');
      // income is 4x expense, so income bar should be 4x taller
      const incomeHeight = Number(incomeBar.props.height);
      const expenseHeight = Number(expenseBar.props.height);
      expect(incomeHeight).toBeGreaterThan(expenseHeight);
      expect(Math.round(incomeHeight / expenseHeight)).toBe(4);
    });
  });
});
