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
});
