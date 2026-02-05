import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SettingsScreen from '../../src/views/screens/SettingsScreen';
import {
  categoryService,
  paymentMethodService,
} from '../../src/views/screens/HomeScreen';

// Mock Alert
jest.spyOn(Alert, 'alert');

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

describe('SettingsScreen', () => {
  beforeEach(() => {
    categoryService.clear();
    paymentMethodService.clear();
    (Alert.alert as jest.Mock).mockClear();
  });

  describe('tab navigation', () => {
    it('should render category tab as default', () => {
      render(<SettingsScreen />);

      expect(screen.getByText('카테고리')).toBeTruthy();
      expect(screen.getByText('결제수단')).toBeTruthy();
    });

    it('should render category sub-tabs (지출/수입)', () => {
      render(<SettingsScreen />);

      // 카테고리 탭에서 지출/수입 서브탭이 보여야 함
      const expenseButtons = screen.getAllByText('지출');
      const incomeButtons = screen.getAllByText('수입');
      expect(expenseButtons.length).toBeGreaterThan(0);
      expect(incomeButtons.length).toBeGreaterThan(0);
    });

    it('should switch to payment method tab when pressed', () => {
      render(<SettingsScreen />);

      fireEvent.press(screen.getByText('결제수단'));

      // 결제수단 탭으로 전환되면 카테고리 서브탭(지출/수입)이 사라져야 함
      expect(screen.getByText('+ 결제수단 추가')).toBeTruthy();
    });
  });

  describe('category management', () => {
    it('should show empty state when no categories', () => {
      render(<SettingsScreen />);

      expect(screen.getByText('카테고리이(가) 없습니다')).toBeTruthy();
    });

    it('should show add category button', () => {
      render(<SettingsScreen />);

      expect(screen.getByText('+ 카테고리 추가')).toBeTruthy();
    });

    it('should open modal when add button is pressed', () => {
      render(<SettingsScreen />);

      fireEvent.press(screen.getByText('+ 카테고리 추가'));

      expect(screen.getByText('새 지출 카테고리')).toBeTruthy();
      expect(screen.getByPlaceholderText('카테고리 이름')).toBeTruthy();
    });

    it('should show alert when trying to add without name', () => {
      render(<SettingsScreen />);

      fireEvent.press(screen.getByText('+ 카테고리 추가'));
      fireEvent.press(screen.getByText('추가'));

      expect(Alert.alert).toHaveBeenCalledWith(
        '오류',
        '카테고리 이름을 입력해주세요'
      );
    });

    it('should add category and show success alert', () => {
      render(<SettingsScreen />);

      fireEvent.press(screen.getByText('+ 카테고리 추가'));
      fireEvent.changeText(
        screen.getByPlaceholderText('카테고리 이름'),
        '식비'
      );
      fireEvent.press(screen.getByText('추가'));

      expect(Alert.alert).toHaveBeenCalledWith(
        '완료',
        '"식비" 카테고리가 생성되었습니다'
      );
    });

    it('should display added category in list', () => {
      categoryService.create({ name: '식비', type: 'expense', icon: '🍔' });

      render(<SettingsScreen />);

      expect(screen.getByText('식비')).toBeTruthy();
      expect(screen.getByText('🍔')).toBeTruthy();
    });

    it('should show delete confirmation when delete is pressed', () => {
      categoryService.create({ name: '식비', type: 'expense' });

      render(<SettingsScreen />);

      fireEvent.press(screen.getByText('삭제'));

      expect(Alert.alert).toHaveBeenCalledWith(
        '삭제 확인',
        '"식비" 카테고리를 삭제하시겠습니까?',
        expect.any(Array)
      );
    });
  });

  describe('payment method management', () => {
    beforeEach(() => {
      // 결제수단 탭으로 전환
    });

    it('should show empty state when no payment methods', () => {
      render(<SettingsScreen />);

      fireEvent.press(screen.getByText('결제수단'));

      expect(screen.getByText('결제수단이(가) 없습니다')).toBeTruthy();
    });

    it('should show add payment method button', () => {
      render(<SettingsScreen />);

      fireEvent.press(screen.getByText('결제수단'));

      expect(screen.getByText('+ 결제수단 추가')).toBeTruthy();
    });

    it('should open modal when add button is pressed', () => {
      render(<SettingsScreen />);

      fireEvent.press(screen.getByText('결제수단'));
      fireEvent.press(screen.getByText('+ 결제수단 추가'));

      expect(screen.getByText('새 결제수단')).toBeTruthy();
    });

    it('should add payment method and show success alert', () => {
      render(<SettingsScreen />);

      fireEvent.press(screen.getByText('결제수단'));
      fireEvent.press(screen.getByText('+ 결제수단 추가'));
      fireEvent.changeText(
        screen.getByPlaceholderText('결제수단 이름 (예: 신용카드, 현금)'),
        '신용카드'
      );
      fireEvent.press(screen.getByText('추가'));

      expect(Alert.alert).toHaveBeenCalledWith(
        '완료',
        '"신용카드" 결제수단이 생성되었습니다'
      );
    });

    it('should display added payment method in list', () => {
      paymentMethodService.create({ name: '신용카드', icon: '💳' });

      render(<SettingsScreen />);

      fireEvent.press(screen.getByText('결제수단'));

      expect(screen.getByText('신용카드')).toBeTruthy();
      expect(screen.getByText('💳')).toBeTruthy();
    });
  });

  describe('icon selection', () => {
    it('should show icon options in category modal', () => {
      render(<SettingsScreen />);

      fireEvent.press(screen.getByText('+ 카테고리 추가'));

      expect(screen.getByText('아이콘 선택')).toBeTruthy();
      expect(screen.getByText('🍔')).toBeTruthy();
      expect(screen.getByText('🚗')).toBeTruthy();
    });

    it('should show icon options in payment method modal', () => {
      render(<SettingsScreen />);

      fireEvent.press(screen.getByText('결제수단'));
      fireEvent.press(screen.getByText('+ 결제수단 추가'));

      expect(screen.getByText('아이콘 선택')).toBeTruthy();
      expect(screen.getByText('💳')).toBeTruthy();
      expect(screen.getByText('💵')).toBeTruthy();
    });
  });

  describe('modal cancel', () => {
    it('should close modal when cancel is pressed', () => {
      render(<SettingsScreen />);

      fireEvent.press(screen.getByText('+ 카테고리 추가'));
      expect(screen.getByText('새 지출 카테고리')).toBeTruthy();

      fireEvent.press(screen.getByText('취소'));

      // 모달이 닫히면 모달 타이틀이 보이지 않아야 함
      expect(screen.queryByText('새 지출 카테고리')).toBeNull();
    });
  });
});
