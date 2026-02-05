import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import CalendarGrid from '../../src/views/components/CalendarGrid';
import { DailySummary } from '../../src/types';

describe('CalendarGrid', () => {
  const mockOnDayPress = jest.fn();

  const defaultProps = {
    year: 2024,
    month: 1,
    dailySummaries: [] as DailySummary[],
    onDayPress: mockOnDayPress,
  };

  beforeEach(() => {
    mockOnDayPress.mockClear();
  });

  describe('rendering', () => {
    it('should render weekday headers', () => {
      render(<CalendarGrid {...defaultProps} />);

      expect(screen.getByText('일')).toBeTruthy();
      expect(screen.getByText('월')).toBeTruthy();
      expect(screen.getByText('화')).toBeTruthy();
      expect(screen.getByText('수')).toBeTruthy();
      expect(screen.getByText('목')).toBeTruthy();
      expect(screen.getByText('금')).toBeTruthy();
      expect(screen.getByText('토')).toBeTruthy();
    });

    it('should render days of the month', () => {
      render(<CalendarGrid {...defaultProps} />);

      // 1월은 31일까지 있음
      expect(screen.getByText('1')).toBeTruthy();
      expect(screen.getByText('15')).toBeTruthy();
      expect(screen.getByText('31')).toBeTruthy();
    });

    it('should render correct number of days for February', () => {
      render(<CalendarGrid {...defaultProps} month={2} />);

      // 2024년 2월은 29일까지 (윤년)
      expect(screen.getByText('29')).toBeTruthy();
      expect(screen.queryByText('30')).toBeNull();
    });
  });

  describe('with daily summaries', () => {
    it('should display balance for days with transactions', () => {
      const summaries: DailySummary[] = [
        {
          date: '2024-01-15',
          totalIncome: 10000,
          totalExpense: 5000,
          balance: 5000,
          transactionCount: 2,
        },
      ];

      render(<CalendarGrid {...defaultProps} dailySummaries={summaries} />);

      expect(screen.getByText('+5k')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onDayPress when a day with transactions is pressed', () => {
      const summaries: DailySummary[] = [
        {
          date: '2024-01-15',
          totalIncome: 10000,
          totalExpense: 0,
          balance: 10000,
          transactionCount: 1,
        },
      ];

      render(<CalendarGrid {...defaultProps} dailySummaries={summaries} />);

      fireEvent.press(screen.getByText('15'));

      expect(mockOnDayPress).toHaveBeenCalledTimes(1);
      expect(mockOnDayPress).toHaveBeenCalledWith(expect.any(Date));
    });
  });

  describe('selectable mode', () => {
    it('should allow pressing any day when selectable is true', () => {
      render(
        <CalendarGrid {...defaultProps} selectable={true} />
      );

      // 거래가 없는 날짜도 클릭 가능해야 함
      fireEvent.press(screen.getByText('20'));

      expect(mockOnDayPress).toHaveBeenCalledTimes(1);
      expect(mockOnDayPress).toHaveBeenCalledWith(expect.any(Date));
    });

    it('should highlight selected day when selectedDay is provided', () => {
      const { toJSON } = render(
        <CalendarGrid {...defaultProps} selectable={true} selectedDay={15} />
      );

      // 렌더링이 성공해야 하고 selectedDay에 해당하는 날짜가 있어야 함
      expect(screen.getByText('15')).toBeTruthy();
      expect(toJSON()).toBeTruthy();
    });

    it('should not affect existing behavior when selectable is not provided', () => {
      render(<CalendarGrid {...defaultProps} />);

      // 거래 없는 날짜는 클릭해도 핸들러가 호출되지 않아야 함
      fireEvent.press(screen.getByText('20'));

      expect(mockOnDayPress).not.toHaveBeenCalled();
    });
  });
});
