import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import CalendarHeader from '../../src/views/components/CalendarHeader';

describe('CalendarHeader', () => {
  const mockOnPrevMonth = jest.fn();
  const mockOnNextMonth = jest.fn();

  beforeEach(() => {
    mockOnPrevMonth.mockClear();
    mockOnNextMonth.mockClear();
  });

  describe('rendering', () => {
    it('should display year and month', () => {
      render(
        <CalendarHeader
          year={2024}
          month={3}
          onPrevMonth={mockOnPrevMonth}
          onNextMonth={mockOnNextMonth}
        />
      );

      expect(screen.getByText('2024년 3월')).toBeTruthy();
    });

    it('should display navigation buttons', () => {
      render(
        <CalendarHeader
          year={2024}
          month={1}
          onPrevMonth={mockOnPrevMonth}
          onNextMonth={mockOnNextMonth}
        />
      );

      expect(screen.getByText('◀')).toBeTruthy();
      expect(screen.getByText('▶')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onPrevMonth when prev button is pressed', () => {
      render(
        <CalendarHeader
          year={2024}
          month={3}
          onPrevMonth={mockOnPrevMonth}
          onNextMonth={mockOnNextMonth}
        />
      );

      fireEvent.press(screen.getByText('◀'));

      expect(mockOnPrevMonth).toHaveBeenCalledTimes(1);
    });

    it('should call onNextMonth when next button is pressed', () => {
      render(
        <CalendarHeader
          year={2024}
          month={3}
          onPrevMonth={mockOnPrevMonth}
          onNextMonth={mockOnNextMonth}
        />
      );

      fireEvent.press(screen.getByText('▶'));

      expect(mockOnNextMonth).toHaveBeenCalledTimes(1);
    });
  });
});
