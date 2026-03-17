import React from 'react';
import { render, screen } from '../test-utils';
import BudgetProgressBar from '../../src/views/components/BudgetProgressBar';
import { BudgetProgress } from '../../src/types';

describe('BudgetProgressBar', () => {
  const defaultTotalProgress = {
    budget: 500000,
    spent: 350000,
    remaining: 150000,
    percentage: 70,
    status: 'warning' as const,
  };

  const defaultCategoryProgress: BudgetProgress[] = [
    {
      categoryId: 'cat-1',
      categoryName: '식비',
      budget: 300000,
      spent: 270000,
      remaining: 30000,
      percentage: 90,
      status: 'over',
    },
    {
      categoryId: 'cat-2',
      categoryName: '교통비',
      budget: 100000,
      spent: 55000,
      remaining: 45000,
      percentage: 55,
      status: 'warning',
    },
    {
      categoryId: 'cat-3',
      categoryName: '여가',
      budget: 100000,
      spent: 25000,
      remaining: 75000,
      percentage: 25,
      status: 'safe',
    },
  ];

  describe('rendering', () => {
    it('should render total budget section', () => {
      render(
        <BudgetProgressBar
          totalProgress={defaultTotalProgress}
          categoryProgress={defaultCategoryProgress}
        />
      );

      expect(screen.getByText('전체 예산')).toBeTruthy();
      expect(screen.getByText('70%')).toBeTruthy();
    });

    it('should render total budget amounts', () => {
      render(
        <BudgetProgressBar
          totalProgress={defaultTotalProgress}
          categoryProgress={defaultCategoryProgress}
        />
      );

      expect(screen.getByText('350,000원')).toBeTruthy();
      expect(screen.getByText('/ 500,000원')).toBeTruthy();
    });

    it('should render category progress items', () => {
      render(
        <BudgetProgressBar
          totalProgress={defaultTotalProgress}
          categoryProgress={defaultCategoryProgress}
        />
      );

      expect(screen.getByText('식비')).toBeTruthy();
      expect(screen.getByText('교통비')).toBeTruthy();
      expect(screen.getByText('여가')).toBeTruthy();
    });

    it('should render category percentages', () => {
      render(
        <BudgetProgressBar
          totalProgress={defaultTotalProgress}
          categoryProgress={defaultCategoryProgress}
        />
      );

      expect(screen.getByText('90%')).toBeTruthy();
      expect(screen.getByText('55%')).toBeTruthy();
      expect(screen.getByText('25%')).toBeTruthy();
    });

    it('should show only top 5 categories by default', () => {
      const manyCategories: BudgetProgress[] = Array.from({ length: 7 }, (_, i) => ({
        categoryId: `cat-${i}`,
        categoryName: `카테고리${i}`,
        budget: 100000,
        spent: (7 - i) * 10000,
        remaining: 100000 - (7 - i) * 10000,
        percentage: (7 - i) * 10,
        status: 'safe' as const,
      }));

      render(
        <BudgetProgressBar
          totalProgress={defaultTotalProgress}
          categoryProgress={manyCategories}
        />
      );

      expect(screen.getByText('카테고리0')).toBeTruthy();
      expect(screen.getByText('카테고리4')).toBeTruthy();
      expect(screen.queryByText('카테고리5')).toBeNull();
    });
  });

  describe('empty state', () => {
    it('should show CTA when no budget is set', () => {
      const emptyTotal = {
        budget: 0,
        spent: 0,
        remaining: 0,
        percentage: 0,
        status: 'safe' as const,
      };

      render(
        <BudgetProgressBar
          totalProgress={emptyTotal}
          categoryProgress={[]}
        />
      );

      expect(screen.getByText('예산을 설정해보세요')).toBeTruthy();
    });
  });

  describe('collapsed state', () => {
    it('should show total bar only when collapsed', () => {
      render(
        <BudgetProgressBar
          totalProgress={defaultTotalProgress}
          categoryProgress={defaultCategoryProgress}
          collapsed={true}
        />
      );

      expect(screen.getByText('전체 예산')).toBeTruthy();
      expect(screen.queryByText('식비')).toBeNull();
    });
  });
});
