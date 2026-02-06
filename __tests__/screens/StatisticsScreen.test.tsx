import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import StatisticsScreen from '../../src/views/screens/StatisticsScreen';
import {
  transactionService,
  categoryService,
  paymentMethodService,
} from '../../src/views/screens/HomeScreen';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  setParams: jest.fn(),
};

// Mock useFocusEffect
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useFocusEffect: (callback: () => void | (() => void)) => {
      React.useEffect(() => {
        const cleanup = callback();
        return cleanup;
      }, []);
    },
  };
});

describe('StatisticsScreen', () => {
  beforeEach(() => {
    transactionService.clear();
    categoryService.clear();
    paymentMethodService.clear();
    mockNavigation.navigate.mockClear();
    mockNavigation.setParams.mockClear();
  });

  describe('rendering', () => {
    it('should render period selector with toggle buttons', () => {
      render(
        <StatisticsScreen
          navigation={mockNavigation as never}
          route={{ key: 'Statistics', name: 'Statistics' }}
        />
      );

      expect(screen.getByText('월별')).toBeTruthy();
      expect(screen.getByText('연도별')).toBeTruthy();
    });

    it('should render summary card', () => {
      render(
        <StatisticsScreen
          navigation={mockNavigation as never}
          route={{ key: 'Statistics', name: 'Statistics' }}
        />
      );

      expect(screen.getByText('잔액')).toBeTruthy();
    });

    it('should render breakdown list titles', () => {
      render(
        <StatisticsScreen
          navigation={mockNavigation as never}
          route={{ key: 'Statistics', name: 'Statistics' }}
        />
      );

      expect(screen.getByText('카테고리별 지출')).toBeTruthy();
      expect(screen.getByText('결제수단별 지출')).toBeTruthy();
    });

    it('should show empty state when no transactions', () => {
      render(
        <StatisticsScreen
          navigation={mockNavigation as never}
          route={{ key: 'Statistics', name: 'Statistics' }}
        />
      );

      const emptyTexts = screen.getAllByText('데이터가 없습니다');
      expect(emptyTexts.length).toBe(2);
    });
  });

  describe('with data', () => {
    beforeEach(() => {
      // 카테고리, 결제수단 등록
      categoryService.create({ name: '식비', type: 'expense', icon: '🍔' });
      categoryService.create({ name: '교통', type: 'expense', icon: '🚌' });
      paymentMethodService.create({ name: '카드', icon: '💳' });
      paymentMethodService.create({ name: '현금', icon: '💵' });

      const categories = categoryService.getAll();
      const methods = paymentMethodService.getAll();

      // 현재 월의 거래 추가
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();

      transactionService.create({
        type: 'expense',
        amount: 60000,
        date: new Date(year, month, 10),
        categoryId: categories[0].id,
        paymentMethodId: methods[0].id,
      });
      transactionService.create({
        type: 'expense',
        amount: 40000,
        date: new Date(year, month, 15),
        categoryId: categories[1].id,
        paymentMethodId: methods[1].id,
      });
      transactionService.create({
        type: 'income',
        amount: 200000,
        date: new Date(year, month, 1),
        categoryId: categories[0].id,
        paymentMethodId: methods[0].id,
      });
    });

    it('should display category breakdown with names', () => {
      render(
        <StatisticsScreen
          navigation={mockNavigation as never}
          route={{ key: 'Statistics', name: 'Statistics' }}
        />
      );

      expect(screen.getByText('식비')).toBeTruthy();
      expect(screen.getByText('교통')).toBeTruthy();
    });

    it('should display payment method breakdown with names', () => {
      render(
        <StatisticsScreen
          navigation={mockNavigation as never}
          route={{ key: 'Statistics', name: 'Statistics' }}
        />
      );

      expect(screen.getByText('카드')).toBeTruthy();
      expect(screen.getByText('현금')).toBeTruthy();
    });
  });

  describe('period navigation', () => {
    it('should switch to yearly mode when 연도별 is pressed', () => {
      render(
        <StatisticsScreen
          navigation={mockNavigation as never}
          route={{ key: 'Statistics', name: 'Statistics' }}
        />
      );

      fireEvent.press(screen.getByText('연도별'));

      const now = new Date();
      expect(screen.getByText(`${now.getFullYear()}년`)).toBeTruthy();
    });

    it('should navigate to previous period when ◀ is pressed', () => {
      render(
        <StatisticsScreen
          navigation={mockNavigation as never}
          route={{ key: 'Statistics', name: 'Statistics' }}
        />
      );

      const now = new Date();
      const expectedMonth = now.getMonth(); // 0-indexed, so previous month
      const expectedYear =
        expectedMonth === 0 ? now.getFullYear() - 1 : now.getFullYear();
      const displayMonth = expectedMonth === 0 ? 12 : expectedMonth;

      fireEvent.press(screen.getByText('◀'));

      expect(
        screen.getByText(`${expectedYear}년 ${displayMonth}월`)
      ).toBeTruthy();
    });

    it('should navigate to next period when ▶ is pressed', () => {
      render(
        <StatisticsScreen
          navigation={mockNavigation as never}
          route={{ key: 'Statistics', name: 'Statistics' }}
        />
      );

      const now = new Date();
      const nextMonth = now.getMonth() + 2; // +1 for 1-indexed, +1 for next
      const expectedYear =
        nextMonth > 12 ? now.getFullYear() + 1 : now.getFullYear();
      const displayMonth = nextMonth > 12 ? nextMonth - 12 : nextMonth;

      fireEvent.press(screen.getByText('▶'));

      expect(
        screen.getByText(`${expectedYear}년 ${displayMonth}월`)
      ).toBeTruthy();
    });

    it('should navigate previous year in yearly mode', () => {
      render(
        <StatisticsScreen
          navigation={mockNavigation as never}
          route={{ key: 'Statistics', name: 'Statistics' }}
        />
      );

      const now = new Date();

      // Switch to yearly mode
      fireEvent.press(screen.getByText('연도별'));
      expect(screen.getByText(`${now.getFullYear()}년`)).toBeTruthy();

      // Navigate prev year
      fireEvent.press(screen.getByText('◀'));
      expect(screen.getByText(`${now.getFullYear() - 1}년`)).toBeTruthy();
    });

    it('should navigate next year in yearly mode', () => {
      render(
        <StatisticsScreen
          navigation={mockNavigation as never}
          route={{ key: 'Statistics', name: 'Statistics' }}
        />
      );

      const now = new Date();

      // Switch to yearly mode
      fireEvent.press(screen.getByText('연도별'));

      // Navigate next year
      fireEvent.press(screen.getByText('▶'));
      expect(screen.getByText(`${now.getFullYear() + 1}년`)).toBeTruthy();
    });

    it('should wrap from January to December of previous year when navigating back', () => {
      render(
        <StatisticsScreen
          navigation={mockNavigation as never}
          route={{ key: 'Statistics', name: 'Statistics' }}
        />
      );

      const now = new Date();
      const currentMonth = now.getMonth() + 1; // 1-indexed

      // Navigate back enough times to reach January, then one more
      for (let i = 0; i < currentMonth; i++) {
        fireEvent.press(screen.getByText('◀'));
      }

      // Should now be December of previous year
      expect(
        screen.getByText(`${now.getFullYear() - 1}년 12월`)
      ).toBeTruthy();
    });

    it('should wrap from December to January of next year when navigating forward', () => {
      render(
        <StatisticsScreen
          navigation={mockNavigation as never}
          route={{ key: 'Statistics', name: 'Statistics' }}
        />
      );

      const now = new Date();
      const currentMonth = now.getMonth() + 1; // 1-indexed
      const remaining = 12 - currentMonth;

      // Navigate forward enough times to reach December, then one more
      for (let i = 0; i <= remaining; i++) {
        fireEvent.press(screen.getByText('▶'));
      }

      // Should now be January of next year
      expect(
        screen.getByText(`${now.getFullYear() + 1}년 1월`)
      ).toBeTruthy();
    });
  });
});
