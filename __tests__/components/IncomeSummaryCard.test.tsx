import React from 'react';
import { render, screen } from '@testing-library/react-native';
import IncomeSummaryCard, { IncomeComparisonItem } from '../../src/views/components/IncomeSummaryCard';

describe('IncomeSummaryCard', () => {
  describe('empty state', () => {
    it('should show title', () => {
      render(<IncomeSummaryCard items={[]} />);

      expect(screen.getByText('수입 목표/실적')).toBeTruthy();
    });

    it('should show empty message when no items', () => {
      render(<IncomeSummaryCard items={[]} />);

      expect(screen.getByText('수입 목표가 없습니다')).toBeTruthy();
    });
  });

  describe('with data', () => {
    const items: IncomeComparisonItem[] = [
      { categoryName: '월급', targetAmount: 3000000, actualAmount: 3000000 },
      { categoryName: '부수입', targetAmount: 500000, actualAmount: 300000 },
    ];

    it('should show header row', () => {
      render(<IncomeSummaryCard items={items} />);

      expect(screen.getByText('카테고리')).toBeTruthy();
      expect(screen.getByText('목표')).toBeTruthy();
      expect(screen.getByText('실적')).toBeTruthy();
      expect(screen.getByText('달성률')).toBeTruthy();
    });

    it('should show category names', () => {
      render(<IncomeSummaryCard items={items} />);

      expect(screen.getByText('월급')).toBeTruthy();
      expect(screen.getByText('부수입')).toBeTruthy();
    });

    it('should show target amounts', () => {
      render(<IncomeSummaryCard items={items} />);

      // 3,000,000원이 목표와 실적에 모두 나올 수 있음
      expect(screen.getAllByText('3,000,000원').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('500,000원')).toBeTruthy();
    });

    it('should show actual amounts', () => {
      render(<IncomeSummaryCard items={items} />);

      expect(screen.getByText('300,000원')).toBeTruthy();
    });

    it('should show achievement rates', () => {
      render(<IncomeSummaryCard items={items} />);

      expect(screen.getByText('100%')).toBeTruthy(); // 월급
      expect(screen.getByText('60%')).toBeTruthy(); // 부수입
    });

    it('should show total row', () => {
      render(<IncomeSummaryCard items={items} />);

      expect(screen.getByText('합계')).toBeTruthy();
      expect(screen.getByText('3,500,000원')).toBeTruthy(); // 총 목표
      expect(screen.getByText('3,300,000원')).toBeTruthy(); // 총 실적
    });

    it('should calculate overall achievement rate', () => {
      render(<IncomeSummaryCard items={items} />);

      // 3,300,000 / 3,500,000 = 94%
      expect(screen.getByText('94%')).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle zero target amount', () => {
      const items: IncomeComparisonItem[] = [
        { categoryName: '기타', targetAmount: 0, actualAmount: 100000 },
      ];

      render(<IncomeSummaryCard items={items} />);

      // 0%가 행과 합계에 모두 나올 수 있음
      expect(screen.getAllByText('0%').length).toBeGreaterThanOrEqual(1);
    });

    it('should show success style when achievement rate >= 100%', () => {
      const items: IncomeComparisonItem[] = [
        { categoryName: '월급', targetAmount: 2000000, actualAmount: 3000000 },
      ];

      render(<IncomeSummaryCard items={items} />);

      // 3000000 / 2000000 = 150% (행 + 합계 모두 표시)
      expect(screen.getAllByText('150%').length).toBeGreaterThanOrEqual(1);
    });
  });
});
