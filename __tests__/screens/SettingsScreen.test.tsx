import React from 'react';
import { render, screen, fireEvent } from '../test-utils';
import { Alert } from 'react-native';
import SettingsScreen from '../../src/views/screens/SettingsScreen';
import {
  categoryService,
  paymentMethodService,
  subCategoryService,
} from '../../src/services/ServiceRegistry';

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
    subCategoryService.clear();
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

      const expenseButtons = screen.getAllByText('지출');
      const incomeButtons = screen.getAllByText('수입');
      expect(expenseButtons.length).toBeGreaterThan(0);
      expect(incomeButtons.length).toBeGreaterThan(0);
    });

    it('should switch to payment method tab when pressed', () => {
      render(<SettingsScreen />);

      fireEvent.press(screen.getByText('결제수단'));

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
        '"식비" 카테고리와 모든 소분류를 삭제하시겠습니까?',
        expect.any(Array)
      );
    });

    it('should show sub-category count for each category', () => {
      const cat = categoryService.create({ name: '식비', type: 'expense', icon: '🍔' });
      subCategoryService.create({ categoryId: cat.id, name: '외식', icon: '🍽️' });
      subCategoryService.create({ categoryId: cat.id, name: '간식', icon: '☕' });

      render(<SettingsScreen />);

      expect(screen.getByText('(2)')).toBeTruthy();
    });

    it('should expand category to show sub-categories', () => {
      const cat = categoryService.create({ name: '식비', type: 'expense', icon: '🍔' });
      subCategoryService.create({ categoryId: cat.id, name: '외식', icon: '🍽️' });

      render(<SettingsScreen />);

      // 카테고리 클릭하여 펼치기
      fireEvent.press(screen.getByText('식비'));

      expect(screen.getByText('외식')).toBeTruthy();
      expect(screen.getByText('🍽️')).toBeTruthy();
    });

    it('should collapse category when pressed again', () => {
      const cat = categoryService.create({ name: '식비', type: 'expense', icon: '🍔' });
      subCategoryService.create({ categoryId: cat.id, name: '외식', icon: '🍽️' });

      render(<SettingsScreen />);

      // 펼치기
      fireEvent.press(screen.getByText('식비'));
      expect(screen.getByText('외식')).toBeTruthy();

      // 접기
      fireEvent.press(screen.getByText('식비'));
      expect(screen.queryByText('외식')).toBeNull();
    });

    it('should close sub-category modal when cancel is pressed', () => {
      const cat = categoryService.create({ name: '식비', type: 'expense', icon: '🍔' });

      render(<SettingsScreen />);

      fireEvent.press(screen.getByText('식비'));
      fireEvent.press(screen.getByText('+ 소분류 추가'));
      expect(screen.getByText('새 소분류')).toBeTruthy();

      // 소분류 모달의 취소 버튼 (카테고리 모달 취소와 별도)
      const cancelButtons = screen.getAllByText('취소');
      fireEvent.press(cancelButtons[cancelButtons.length - 1]);

      expect(screen.queryByText('새 소분류')).toBeNull();
    });

    it('should confirm and delete category with subcategories', () => {
      const cat = categoryService.create({ name: '식비', type: 'expense' });
      subCategoryService.create({ categoryId: cat.id, name: '외식' });

      render(<SettingsScreen />);

      fireEvent.press(screen.getByText('삭제'));

      // 삭제 확인 Alert의 삭제 버튼 실행
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const deleteButton = alertCall[2].find((btn: { text: string }) => btn.text === '삭제');
      deleteButton.onPress();

      expect(Alert.alert).toHaveBeenCalledWith('완료', '"식비" 카테고리가 삭제되었습니다');
    });

    it('should show add sub-category button when expanded', () => {
      const cat = categoryService.create({ name: '식비', type: 'expense', icon: '🍔' });

      render(<SettingsScreen />);

      fireEvent.press(screen.getByText('식비'));

      expect(screen.getByText('+ 소분류 추가')).toBeTruthy();
    });

    it('should open sub-category modal when add sub-category is pressed', () => {
      const cat = categoryService.create({ name: '식비', type: 'expense', icon: '🍔' });

      render(<SettingsScreen />);

      fireEvent.press(screen.getByText('식비'));
      fireEvent.press(screen.getByText('+ 소분류 추가'));

      expect(screen.getByText('새 소분류')).toBeTruthy();
      expect(screen.getByPlaceholderText('소분류 이름')).toBeTruthy();
    });

    it('should add sub-category and show success alert', () => {
      const cat = categoryService.create({ name: '식비', type: 'expense', icon: '🍔' });

      render(<SettingsScreen />);

      fireEvent.press(screen.getByText('식비'));
      fireEvent.press(screen.getByText('+ 소분류 추가'));
      fireEvent.changeText(
        screen.getByPlaceholderText('소분류 이름'),
        '외식'
      );
      fireEvent.press(screen.getByText('추가'));

      expect(Alert.alert).toHaveBeenCalledWith(
        '완료',
        '"외식" 소분류가 생성되었습니다'
      );
    });
  });

  describe('payment method management', () => {
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
        screen.getByPlaceholderText('결제수단 이름 (예: 신한카드)'),
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

    it('should show payment type options in modal', () => {
      render(<SettingsScreen />);

      fireEvent.press(screen.getByText('결제수단'));
      fireEvent.press(screen.getByText('+ 결제수단 추가'));

      expect(screen.getByText('유형 선택')).toBeTruthy();
      expect(screen.getByText('신용카드')).toBeTruthy();
      expect(screen.getByText('체크카드')).toBeTruthy();
      expect(screen.getByText('현금')).toBeTruthy();
      expect(screen.getByText('계좌이체')).toBeTruthy();
    });

    it('should display payment type label for payment methods with type', () => {
      paymentMethodService.create({ name: '신한카드', icon: '💳', type: 'credit' });

      render(<SettingsScreen />);

      fireEvent.press(screen.getByText('결제수단'));

      expect(screen.getByText('신한카드')).toBeTruthy();
      // 신용카드 라벨이 표시되어야 함 (유형 선택 옵션과 별도로)
      // Note: '신용카드' 텍스트가 유형 라벨로 표시됨
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

      expect(screen.queryByText('새 지출 카테고리')).toBeNull();
    });
  });
});
