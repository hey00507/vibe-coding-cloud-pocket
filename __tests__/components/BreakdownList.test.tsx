import React from 'react';
import { render, screen } from '../test-utils';
import BreakdownList from '../../src/views/components/BreakdownList';
import { BreakdownItem } from '../../src/views/components/BreakdownList';

describe('BreakdownList', () => {
  const sampleItems: BreakdownItem[] = [
    {
      id: 'food',
      name: '식비',
      icon: '🍔',
      amount: 150000,
      percentage: 60,
      transactionCount: 5,
    },
    {
      id: 'transport',
      name: '교통',
      icon: '🚌',
      amount: 75000,
      percentage: 30,
      transactionCount: 3,
    },
    {
      id: 'misc',
      name: '기타',
      amount: 25000,
      percentage: 10,
      transactionCount: 1,
    },
  ];

  describe('rendering', () => {
    it('should render the title', () => {
      render(<BreakdownList title="카테고리별 지출" items={sampleItems} />);

      expect(screen.getByText('카테고리별 지출')).toBeTruthy();
    });

    it('should render all items', () => {
      render(<BreakdownList title="카테고리별 지출" items={sampleItems} />);

      expect(screen.getByText('식비')).toBeTruthy();
      expect(screen.getByText('교통')).toBeTruthy();
      expect(screen.getByText('기타')).toBeTruthy();
    });

    it('should display amount for each item', () => {
      render(<BreakdownList title="카테고리별 지출" items={sampleItems} />);

      expect(screen.getByText('150,000원')).toBeTruthy();
      expect(screen.getByText('75,000원')).toBeTruthy();
      expect(screen.getByText('25,000원')).toBeTruthy();
    });

    it('should display percentage for each item', () => {
      render(<BreakdownList title="카테고리별 지출" items={sampleItems} />);

      expect(screen.getByText('60%')).toBeTruthy();
      expect(screen.getByText('30%')).toBeTruthy();
      expect(screen.getByText('10%')).toBeTruthy();
    });

    it('should display transaction count for each item', () => {
      render(<BreakdownList title="카테고리별 지출" items={sampleItems} />);

      expect(screen.getByText('5건')).toBeTruthy();
      expect(screen.getByText('3건')).toBeTruthy();
      expect(screen.getByText('1건')).toBeTruthy();
    });

    it('should display icon when provided', () => {
      render(<BreakdownList title="카테고리별 지출" items={sampleItems} />);

      expect(screen.getByText('🍔')).toBeTruthy();
      expect(screen.getByText('🚌')).toBeTruthy();
    });

    it('should show empty state when no items', () => {
      render(<BreakdownList title="카테고리별 지출" items={[]} />);

      expect(screen.getByText('데이터가 없습니다')).toBeTruthy();
    });
  });
});
