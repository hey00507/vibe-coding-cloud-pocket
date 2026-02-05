import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import DayCell from '../../src/views/components/DayCell';

describe('DayCell', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  describe('rendering', () => {
    it('should render day number', () => {
      render(<DayCell day={15} />);

      expect(screen.getByText('15')).toBeTruthy();
    });

    it('should render empty cell when day is null', () => {
      const { toJSON } = render(<DayCell day={null} />);

      // 빈 셀은 텍스트가 없어야 함
      expect(screen.queryByText('15')).toBeNull();
      expect(toJSON()).toBeTruthy();
    });

    it('should render balance when hasTransactions is true', () => {
      render(<DayCell day={15} balance={5000} hasTransactions={true} />);

      expect(screen.getByText('+5k')).toBeTruthy();
    });

    it('should not render balance when hasTransactions is false', () => {
      render(<DayCell day={15} balance={5000} hasTransactions={false} />);

      expect(screen.queryByText('+5k')).toBeNull();
    });
  });

  describe('balance formatting', () => {
    it('should format positive balance with +', () => {
      render(<DayCell day={1} balance={10000} hasTransactions={true} />);

      expect(screen.getByText('+10k')).toBeTruthy();
    });

    it('should format negative balance with -', () => {
      render(<DayCell day={1} balance={-5000} hasTransactions={true} />);

      expect(screen.getByText('-5k')).toBeTruthy();
    });

    it('should format small amounts without k suffix', () => {
      render(<DayCell day={1} balance={500} hasTransactions={true} />);

      expect(screen.getByText('+500')).toBeTruthy();
    });

    it('should format millions with M suffix', () => {
      render(<DayCell day={1} balance={1500000} hasTransactions={true} />);

      expect(screen.getByText('+1.5M')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onPress when pressed and hasTransactions is true', () => {
      render(
        <DayCell
          day={15}
          balance={1000}
          hasTransactions={true}
          onPress={mockOnPress}
        />
      );

      fireEvent.press(screen.getByText('15'));

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when hasTransactions is false', () => {
      render(
        <DayCell
          day={15}
          balance={1000}
          hasTransactions={false}
          onPress={mockOnPress}
        />
      );

      fireEvent.press(screen.getByText('15'));

      expect(mockOnPress).not.toHaveBeenCalled();
    });
  });

  describe('selectable mode', () => {
    it('should allow press on any day when selectable is true', () => {
      render(
        <DayCell
          day={20}
          hasTransactions={false}
          selectable={true}
          onPress={mockOnPress}
        />
      );

      fireEvent.press(screen.getByText('20'));

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should apply selected style when isSelected is true', () => {
      const { toJSON } = render(
        <DayCell
          day={10}
          selectable={true}
          isSelected={true}
          onPress={mockOnPress}
        />
      );

      const tree = toJSON();
      // selectedCell 스타일이 적용되어야 함
      expect(tree).toBeTruthy();
      // 컴포넌트가 렌더링되면 스타일에 backgroundColor: '#BBDEFB'가 포함
      const flatStyles = (tree as any).props.style;
      const hasSelectedBg = flatStyles.some
        ? flatStyles.some((s: any) => s?.backgroundColor === '#BBDEFB')
        : flatStyles?.backgroundColor === '#BBDEFB';
      expect(hasSelectedBg).toBe(true);
    });

    it('should not apply selected style when isSelected is false', () => {
      const { toJSON } = render(
        <DayCell
          day={10}
          selectable={true}
          isSelected={false}
          onPress={mockOnPress}
        />
      );

      const tree = toJSON();
      const flatStyles = (tree as any).props.style;
      const hasSelectedBg = flatStyles.some
        ? flatStyles.some((s: any) => s?.backgroundColor === '#BBDEFB')
        : flatStyles?.backgroundColor === '#BBDEFB';
      expect(hasSelectedBg).toBe(false);
    });
  });
});
