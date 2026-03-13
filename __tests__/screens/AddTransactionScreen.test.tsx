import React from 'react';
import { render, screen, fireEvent, act } from '../test-utils';
import { Alert } from 'react-native';
import AddTransactionScreen from '../../src/views/screens/AddTransactionScreen';
import {
  transactionService,
  categoryService,
  paymentMethodService,
  subCategoryService,
} from '../../src/services/ServiceRegistry';

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  setParams: jest.fn(),
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

describe('AddTransactionScreen', () => {
  beforeEach(() => {
    transactionService.clear();
    categoryService.clear();
    paymentMethodService.clear();
    subCategoryService.clear();
    mockNavigation.navigate.mockClear();
    (Alert.alert as jest.Mock).mockClear();

    // 기본 테스트 데이터 설정
    categoryService.create({ name: '식비', type: 'expense', icon: '🍔' });
    categoryService.create({ name: '급여', type: 'income', icon: '💰' });
    paymentMethodService.create({ name: '신용카드', icon: '💳' });
  });

  describe('rendering', () => {
    it('should render type selection buttons', () => {
      render(
        <AddTransactionScreen
          navigation={mockNavigation as never}
          route={{ key: 'AddTransaction', name: 'AddTransaction' }}
        />
      );

      expect(screen.getByText('지출')).toBeTruthy();
      expect(screen.getByText('수입')).toBeTruthy();
    });

    it('should render amount input', () => {
      render(
        <AddTransactionScreen
          navigation={mockNavigation as never}
          route={{ key: 'AddTransaction', name: 'AddTransaction' }}
        />
      );

      expect(screen.getByText('금액')).toBeTruthy();
      expect(screen.getByPlaceholderText('0')).toBeTruthy();
    });

    it('should render category section', () => {
      render(
        <AddTransactionScreen
          navigation={mockNavigation as never}
          route={{ key: 'AddTransaction', name: 'AddTransaction' }}
        />
      );

      expect(screen.getByText('카테고리')).toBeTruthy();
    });

    it('should render payment method section', () => {
      render(
        <AddTransactionScreen
          navigation={mockNavigation as never}
          route={{ key: 'AddTransaction', name: 'AddTransaction' }}
        />
      );

      expect(screen.getByText('결제수단')).toBeTruthy();
    });

    it('should render memo input', () => {
      render(
        <AddTransactionScreen
          navigation={mockNavigation as never}
          route={{ key: 'AddTransaction', name: 'AddTransaction' }}
        />
      );

      expect(screen.getByText('메모 (선택)')).toBeTruthy();
      expect(screen.getByPlaceholderText('메모를 입력하세요')).toBeTruthy();
    });

    it('should render submit button', () => {
      render(
        <AddTransactionScreen
          navigation={mockNavigation as never}
          route={{ key: 'AddTransaction', name: 'AddTransaction' }}
        />
      );

      expect(screen.getByText('지출 추가')).toBeTruthy();
    });
  });

  describe('type selection', () => {
    it('should default to expense type', () => {
      render(
        <AddTransactionScreen
          navigation={mockNavigation as never}
          route={{ key: 'AddTransaction', name: 'AddTransaction' }}
        />
      );

      expect(screen.getByText('지출 추가')).toBeTruthy();
    });

    it('should switch to income type when pressed', () => {
      render(
        <AddTransactionScreen
          navigation={mockNavigation as never}
          route={{ key: 'AddTransaction', name: 'AddTransaction' }}
        />
      );

      const incomeButtons = screen.getAllByText('수입');
      fireEvent.press(incomeButtons[0]);

      expect(screen.getByText('수입 추가')).toBeTruthy();
    });

    it('should show expense categories when expense is selected', () => {
      render(
        <AddTransactionScreen
          navigation={mockNavigation as never}
          route={{ key: 'AddTransaction', name: 'AddTransaction' }}
        />
      );

      expect(screen.getByText('🍔 식비')).toBeTruthy();
    });

    it('should show income categories when income is selected', () => {
      render(
        <AddTransactionScreen
          navigation={mockNavigation as never}
          route={{ key: 'AddTransaction', name: 'AddTransaction' }}
        />
      );

      const incomeButtons = screen.getAllByText('수입');
      fireEvent.press(incomeButtons[0]);

      expect(screen.getByText('💰 급여')).toBeTruthy();
    });
  });

  describe('sub-category selection', () => {
    it('should show sub-categories when expense category has sub-categories', () => {
      const cat = categoryService.getByType('expense')[0];
      subCategoryService.create({ categoryId: cat.id, name: '외식', icon: '🍽️' });
      subCategoryService.create({ categoryId: cat.id, name: '간식', icon: '☕' });

      render(
        <AddTransactionScreen
          navigation={mockNavigation as never}
          route={{ key: 'AddTransaction', name: 'AddTransaction' }}
        />
      );

      expect(screen.getByText('소분류')).toBeTruthy();
      expect(screen.getByText('🍽️ 외식')).toBeTruthy();
      expect(screen.getByText('☕ 간식')).toBeTruthy();
    });

    it('should not show sub-category section for income type', () => {
      render(
        <AddTransactionScreen
          navigation={mockNavigation as never}
          route={{ key: 'AddTransaction', name: 'AddTransaction' }}
        />
      );

      const incomeButtons = screen.getAllByText('수입');
      fireEvent.press(incomeButtons[0]);

      expect(screen.queryByText('소분류')).toBeNull();
    });

    it('should include subCategoryId in transaction when sub-category is selected', () => {
      const cat = categoryService.getByType('expense')[0];
      const sub = subCategoryService.create({ categoryId: cat.id, name: '외식', icon: '🍽️' });

      render(
        <AddTransactionScreen
          navigation={mockNavigation as never}
          route={{ key: 'AddTransaction', name: 'AddTransaction' }}
        />
      );

      fireEvent.changeText(screen.getByPlaceholderText('0'), '15000');
      fireEvent.press(screen.getByText('지출 추가'));

      const transactions = transactionService.getAll();
      expect(transactions).toHaveLength(1);
      expect(transactions[0].subCategoryId).toBe(sub.id);
    });
  });

  describe('validation', () => {
    it('should show error when amount is empty', () => {
      render(
        <AddTransactionScreen
          navigation={mockNavigation as never}
          route={{ key: 'AddTransaction', name: 'AddTransaction' }}
        />
      );

      fireEvent.press(screen.getByText('지출 추가'));

      expect(Alert.alert).toHaveBeenCalledWith(
        '오류',
        '올바른 금액을 입력해주세요'
      );
    });

    it('should show error when amount is zero', () => {
      render(
        <AddTransactionScreen
          navigation={mockNavigation as never}
          route={{ key: 'AddTransaction', name: 'AddTransaction' }}
        />
      );

      fireEvent.changeText(screen.getByPlaceholderText('0'), '0');
      fireEvent.press(screen.getByText('지출 추가'));

      expect(Alert.alert).toHaveBeenCalledWith(
        '오류',
        '올바른 금액을 입력해주세요'
      );
    });

    it('should show error when no categories exist', () => {
      categoryService.clear();

      render(
        <AddTransactionScreen
          navigation={mockNavigation as never}
          route={{ key: 'AddTransaction', name: 'AddTransaction' }}
        />
      );

      fireEvent.changeText(screen.getByPlaceholderText('0'), '10000');
      fireEvent.press(screen.getByText('지출 추가'));

      expect(Alert.alert).toHaveBeenCalledWith(
        '오류',
        '카테고리를 선택해주세요'
      );
    });
  });

  describe('submission', () => {
    it('should show success alert with amount when transaction is added', () => {
      render(
        <AddTransactionScreen
          navigation={mockNavigation as never}
          route={{ key: 'AddTransaction', name: 'AddTransaction' }}
        />
      );

      fireEvent.changeText(screen.getByPlaceholderText('0'), '15000');
      fireEvent.press(screen.getByText('지출 추가'));

      expect(Alert.alert).toHaveBeenCalledWith(
        '완료',
        '지출 15,000원이 등록되었습니다',
        expect.arrayContaining([
          expect.objectContaining({ text: '완료' }),
          expect.objectContaining({ text: '계속 등록' }),
        ])
      );
    });

    it('should create transaction in service', () => {
      render(
        <AddTransactionScreen
          navigation={mockNavigation as never}
          route={{ key: 'AddTransaction', name: 'AddTransaction' }}
        />
      );

      fireEvent.changeText(screen.getByPlaceholderText('0'), '15000');
      fireEvent.press(screen.getByText('지출 추가'));

      const transactions = transactionService.getAll();
      expect(transactions).toHaveLength(1);
      expect(transactions[0].amount).toBe(15000);
      expect(transactions[0].type).toBe('expense');
    });
  });

  describe('date selector', () => {
    it('should render date selector', () => {
      render(
        <AddTransactionScreen
          navigation={mockNavigation as never}
          route={{ key: 'AddTransaction', name: 'AddTransaction' }}
        />
      );

      expect(screen.getByText('날짜')).toBeTruthy();
      expect(screen.getByText('오늘')).toBeTruthy();
      expect(screen.getByText('어제')).toBeTruthy();
      expect(screen.getByText('직접 선택')).toBeTruthy();
    });

    it('should use selected date when creating transaction', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2026, 1, 6));

      render(
        <AddTransactionScreen
          navigation={mockNavigation as never}
          route={{ key: 'AddTransaction', name: 'AddTransaction' }}
        />
      );

      fireEvent.press(screen.getByText('어제'));

      fireEvent.changeText(screen.getByPlaceholderText('0'), '10000');
      fireEvent.press(screen.getByText('지출 추가'));

      const transactions = transactionService.getAll();
      expect(transactions).toHaveLength(1);
      const txDate = new Date(transactions[0].date);
      expect(txDate.getDate()).toBe(5);

      jest.useRealTimers();
    });
  });

  describe('submission flow', () => {
    it('should navigate to Home with selectedDate on confirm', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2026, 1, 6));

      render(
        <AddTransactionScreen
          navigation={mockNavigation as never}
          route={{ key: 'AddTransaction', name: 'AddTransaction' }}
        />
      );

      fireEvent.changeText(screen.getByPlaceholderText('0'), '15000');
      fireEvent.press(screen.getByText('지출 추가'));

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const confirmButton = alertCall[2].find(
        (btn: any) => btn.text === '완료'
      );
      confirmButton.onPress();

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Home', {
        selectedDate: '2026-02-06',
      });

      jest.useRealTimers();
    });

    it('should reset form and date on continue registration', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2026, 1, 6));

      render(
        <AddTransactionScreen
          navigation={mockNavigation as never}
          route={{ key: 'AddTransaction', name: 'AddTransaction' }}
        />
      );

      fireEvent.press(screen.getByText('어제'));
      fireEvent.changeText(screen.getByPlaceholderText('0'), '15000');
      fireEvent.press(screen.getByText('지출 추가'));

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const continueButton = alertCall[2].find(
        (btn: any) => btn.text === '계속 등록'
      );
      act(() => {
        continueButton.onPress();
      });

      expect(screen.getByPlaceholderText('0').props.value).toBe('');
      expect(screen.getByText('2026년 2월 6일 (금)')).toBeTruthy();

      jest.useRealTimers();
    });
  });

  describe('empty state messages', () => {
    it('should show message when no categories exist', () => {
      categoryService.clear();

      render(
        <AddTransactionScreen
          navigation={mockNavigation as never}
          route={{ key: 'AddTransaction', name: 'AddTransaction' }}
        />
      );

      expect(
        screen.getByText('카테고리가 없습니다. 먼저 카테고리를 추가해주세요.')
      ).toBeTruthy();
    });

    it('should show message when no payment methods exist', () => {
      paymentMethodService.clear();

      render(
        <AddTransactionScreen
          navigation={mockNavigation as never}
          route={{ key: 'AddTransaction', name: 'AddTransaction' }}
        />
      );

      expect(
        screen.getByText('결제수단이 없습니다. 먼저 결제수단을 추가해주세요.')
      ).toBeTruthy();
    });
  });
});
