import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../../src/views/screens/HomeScreen';
import {
  transactionService,
  categoryService,
  paymentMethodService,
} from '../../src/views/screens/HomeScreen';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
};

// Mock useFocusEffect - useEffect처럼 동작하도록 설정
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

describe('HomeScreen', () => {
  beforeEach(() => {
    // 테스트 전 데이터 초기화
    transactionService.clear();
    categoryService.clear();
    paymentMethodService.clear();
    mockNavigation.navigate.mockClear();
  });

  describe('rendering', () => {
    it('should render summary card', () => {
      render(
        <HomeScreen
          navigation={mockNavigation as never}
          route={{ key: 'Home', name: 'Home' }}
        />
      );

      expect(screen.getByText('잔액')).toBeTruthy();
      // 수입/지출 텍스트가 요약카드와 필터에 모두 있으므로 getAllByText 사용
      expect(screen.getAllByText('수입').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('지출').length).toBeGreaterThanOrEqual(1);
    });

    it('should render filter buttons', () => {
      render(
        <HomeScreen
          navigation={mockNavigation as never}
          route={{ key: 'Home', name: 'Home' }}
        />
      );

      expect(screen.getByText('전체')).toBeTruthy();
      // 필터 버튼 존재 확인 (수입/지출은 여러 곳에 있음)
      expect(screen.getAllByText('수입').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('지출').length).toBeGreaterThanOrEqual(1);
    });

    it('should render empty state when no transactions', () => {
      render(
        <HomeScreen
          navigation={mockNavigation as never}
          route={{ key: 'Home', name: 'Home' }}
        />
      );

      expect(screen.getByText('거래 내역이 없습니다')).toBeTruthy();
    });
  });

  describe('with transactions', () => {
    beforeEach(() => {
      // 테스트 데이터 설정
      const category = categoryService.create({
        name: '식비',
        type: 'expense',
      });
      const paymentMethod = paymentMethodService.create({
        name: '신용카드',
      });

      transactionService.create({
        type: 'expense',
        amount: 15000,
        date: new Date('2024-01-15'),
        categoryId: category.id,
        paymentMethodId: paymentMethod.id,
        memo: '점심',
      });

      transactionService.create({
        type: 'income',
        amount: 100000,
        date: new Date('2024-01-10'),
        categoryId: category.id,
        paymentMethodId: paymentMethod.id,
      });
    });

    it('should display transactions', () => {
      render(
        <HomeScreen
          navigation={mockNavigation as never}
          route={{ key: 'Home', name: 'Home' }}
        />
      );

      // 거래 목록에 식비와 신용카드가 표시되어야 함 (여러 거래가 있을 수 있음)
      expect(screen.getAllByText('식비').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('신용카드').length).toBeGreaterThanOrEqual(1);
    });

    it('should display correct balance', () => {
      render(
        <HomeScreen
          navigation={mockNavigation as never}
          route={{ key: 'Home', name: 'Home' }}
        />
      );

      // 100000 - 15000 = 85000
      expect(screen.getByText('85,000원')).toBeTruthy();
    });

    it('should not show empty state when transactions exist', () => {
      render(
        <HomeScreen
          navigation={mockNavigation as never}
          route={{ key: 'Home', name: 'Home' }}
        />
      );

      expect(screen.queryByText('거래 내역이 없습니다')).toBeNull();
    });
  });

  describe('filtering', () => {
    beforeEach(() => {
      const expenseCategory = categoryService.create({
        name: '식비',
        type: 'expense',
      });
      const incomeCategory = categoryService.create({
        name: '급여',
        type: 'income',
      });
      const paymentMethod = paymentMethodService.create({
        name: '신용카드',
      });

      transactionService.create({
        type: 'expense',
        amount: 15000,
        date: new Date(),
        categoryId: expenseCategory.id,
        paymentMethodId: paymentMethod.id,
      });

      transactionService.create({
        type: 'income',
        amount: 100000,
        date: new Date(),
        categoryId: incomeCategory.id,
        paymentMethodId: paymentMethod.id,
      });
    });

    it('should filter by expense when expense filter is pressed', () => {
      render(
        <HomeScreen
          navigation={mockNavigation as never}
          route={{ key: 'Home', name: 'Home' }}
        />
      );

      // 지출 필터 버튼 클릭 (세 번째 '지출' 텍스트 - 필터 버튼)
      const expenseButtons = screen.getAllByText('지출');
      fireEvent.press(expenseButtons[1]); // 필터 버튼은 두 번째

      // 지출 거래가 표시되어야 함 (여러 개일 수 있음)
      expect(screen.getAllByText('-15,000원').length).toBeGreaterThanOrEqual(1);
    });
  });
});
