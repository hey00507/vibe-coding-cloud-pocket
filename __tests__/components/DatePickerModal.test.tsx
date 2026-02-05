import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import DatePickerModal from '../../src/views/components/DatePickerModal';

describe('DatePickerModal', () => {
  const mockOnDateSelect = jest.fn();
  const mockOnClose = jest.fn();

  const defaultProps = {
    visible: true,
    selectedDate: new Date(2026, 1, 6), // 2026-02-06
    onDateSelect: mockOnDateSelect,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    mockOnDateSelect.mockClear();
    mockOnClose.mockClear();
  });

  describe('rendering', () => {
    it('should render when visible is true', () => {
      render(<DatePickerModal {...defaultProps} />);

      // 캘린더 헤더가 보여야 함
      expect(screen.getByText('2026년 2월')).toBeTruthy();
    });

    it('should not render content when visible is false', () => {
      render(<DatePickerModal {...defaultProps} visible={false} />);

      expect(screen.queryByText('2026년 2월')).toBeNull();
    });

    it('should render cancel button', () => {
      render(<DatePickerModal {...defaultProps} />);

      expect(screen.getByText('취소')).toBeTruthy();
    });

    it('should render weekday headers', () => {
      render(<DatePickerModal {...defaultProps} />);

      expect(screen.getByText('일')).toBeTruthy();
      expect(screen.getByText('월')).toBeTruthy();
      expect(screen.getByText('토')).toBeTruthy();
    });

    it('should render days of the selected month', () => {
      render(<DatePickerModal {...defaultProps} />);

      // 2월은 28일까지 (2026년은 평년)
      expect(screen.getByText('1')).toBeTruthy();
      expect(screen.getByText('28')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onDateSelect when a day is pressed', () => {
      render(<DatePickerModal {...defaultProps} />);

      fireEvent.press(screen.getByText('15'));

      expect(mockOnDateSelect).toHaveBeenCalledTimes(1);
      expect(mockOnDateSelect).toHaveBeenCalledWith(expect.any(Date));
      // 선택된 날짜가 2026-02-15인지 확인
      const selectedDate = mockOnDateSelect.mock.calls[0][0] as Date;
      expect(selectedDate.getFullYear()).toBe(2026);
      expect(selectedDate.getMonth()).toBe(1); // 0-indexed
      expect(selectedDate.getDate()).toBe(15);
    });

    it('should call onClose when cancel button is pressed', () => {
      render(<DatePickerModal {...defaultProps} />);

      fireEvent.press(screen.getByText('취소'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should navigate to previous month', () => {
      render(<DatePickerModal {...defaultProps} />);

      fireEvent.press(screen.getByText('◀'));

      expect(screen.getByText('2026년 1월')).toBeTruthy();
    });

    it('should navigate to next month', () => {
      render(<DatePickerModal {...defaultProps} />);

      fireEvent.press(screen.getByText('▶'));

      expect(screen.getByText('2026년 3월')).toBeTruthy();
    });

    it('should handle year boundary when navigating months', () => {
      const janDate = new Date(2026, 0, 15); // 2026-01
      render(<DatePickerModal {...defaultProps} selectedDate={janDate} />);

      // 1월에서 이전 달로 이동하면 2025년 12월
      fireEvent.press(screen.getByText('◀'));

      expect(screen.getByText('2025년 12월')).toBeTruthy();
    });

    it('should select date in navigated month', () => {
      render(<DatePickerModal {...defaultProps} />);

      // 3월로 이동
      fireEvent.press(screen.getByText('▶'));

      // 3월의 날짜 선택
      fireEvent.press(screen.getByText('10'));

      const selectedDate = mockOnDateSelect.mock.calls[0][0] as Date;
      expect(selectedDate.getFullYear()).toBe(2026);
      expect(selectedDate.getMonth()).toBe(2); // March (0-indexed)
      expect(selectedDate.getDate()).toBe(10);
    });

    it('should handle year boundary when navigating forward from December', () => {
      const decDate = new Date(2026, 11, 15); // 2026-12
      render(<DatePickerModal {...defaultProps} selectedDate={decDate} />);

      expect(screen.getByText('2026년 12월')).toBeTruthy();

      // 12월에서 다음 달로 이동하면 2027년 1월
      fireEvent.press(screen.getByText('▶'));

      expect(screen.getByText('2027년 1월')).toBeTruthy();
    });
  });
});
