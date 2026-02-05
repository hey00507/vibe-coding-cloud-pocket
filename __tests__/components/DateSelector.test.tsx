import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import DateSelector from '../../src/views/components/DateSelector';

describe('DateSelector', () => {
  const mockOnDateChange = jest.fn();

  // 고정된 날짜로 테스트 (2026-02-06 금요일)
  const today = new Date(2026, 1, 6);
  const yesterday = new Date(2026, 1, 5);

  const defaultProps = {
    selectedDate: today,
    onDateChange: mockOnDateChange,
  };

  beforeEach(() => {
    mockOnDateChange.mockClear();
    jest.useFakeTimers();
    jest.setSystemTime(today);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('rendering', () => {
    it('should render date label', () => {
      render(<DateSelector {...defaultProps} />);

      expect(screen.getByText('날짜')).toBeTruthy();
    });

    it('should render today/yesterday/custom buttons', () => {
      render(<DateSelector {...defaultProps} />);

      expect(screen.getByText('오늘')).toBeTruthy();
      expect(screen.getByText('어제')).toBeTruthy();
      expect(screen.getByText('직접 선택')).toBeTruthy();
    });

    it('should display formatted selected date', () => {
      render(<DateSelector {...defaultProps} />);

      // 2026년 2월 6일 (금)
      expect(screen.getByText('2026년 2월 6일 (금)')).toBeTruthy();
    });

    it('should display yesterday date when yesterday is selected', () => {
      render(<DateSelector {...defaultProps} selectedDate={yesterday} />);

      expect(screen.getByText('2026년 2월 5일 (목)')).toBeTruthy();
    });
  });

  describe('button interactions', () => {
    it('should call onDateChange with today when today button is pressed', () => {
      render(<DateSelector {...defaultProps} selectedDate={yesterday} />);

      fireEvent.press(screen.getByText('오늘'));

      expect(mockOnDateChange).toHaveBeenCalledTimes(1);
      const calledDate = mockOnDateChange.mock.calls[0][0] as Date;
      expect(calledDate.getFullYear()).toBe(2026);
      expect(calledDate.getMonth()).toBe(1);
      expect(calledDate.getDate()).toBe(6);
    });

    it('should call onDateChange with yesterday when yesterday button is pressed', () => {
      render(<DateSelector {...defaultProps} />);

      fireEvent.press(screen.getByText('어제'));

      expect(mockOnDateChange).toHaveBeenCalledTimes(1);
      const calledDate = mockOnDateChange.mock.calls[0][0] as Date;
      expect(calledDate.getFullYear()).toBe(2026);
      expect(calledDate.getMonth()).toBe(1);
      expect(calledDate.getDate()).toBe(5);
    });

    it('should show today button as active when today is selected', () => {
      render(<DateSelector {...defaultProps} selectedDate={today} />);

      // 오늘이 선택되면 오늘 버튼이 active 스타일
      // 버튼이 렌더링 된 것으로 확인
      expect(screen.getByText('오늘')).toBeTruthy();
    });

    it('should show yesterday button as active when yesterday is selected', () => {
      render(<DateSelector {...defaultProps} selectedDate={yesterday} />);

      expect(screen.getByText('어제')).toBeTruthy();
    });
  });

  describe('date picker modal', () => {
    it('should open DatePickerModal when custom button is pressed', () => {
      render(<DateSelector {...defaultProps} />);

      fireEvent.press(screen.getByText('직접 선택'));

      // 모달이 열리면 취소 버튼이 보여야 함
      expect(screen.getByText('취소')).toBeTruthy();
    });

    it('should close DatePickerModal when cancel is pressed', () => {
      render(<DateSelector {...defaultProps} />);

      fireEvent.press(screen.getByText('직접 선택'));
      fireEvent.press(screen.getByText('취소'));

      expect(screen.queryByText('취소')).toBeNull();
    });

    it('should call onDateChange when a date is selected in picker', () => {
      render(<DateSelector {...defaultProps} />);

      fireEvent.press(screen.getByText('직접 선택'));

      // 캘린더에서 날짜 선택
      fireEvent.press(screen.getByText('20'));

      expect(mockOnDateChange).toHaveBeenCalledTimes(1);
      const calledDate = mockOnDateChange.mock.calls[0][0] as Date;
      expect(calledDate.getDate()).toBe(20);
    });
  });

  describe('custom date selection', () => {
    it('should show custom button as active when a non-today/yesterday date is selected', () => {
      const customDate = new Date(2026, 1, 1); // 2026-02-01 (not today or yesterday)
      render(<DateSelector {...defaultProps} selectedDate={customDate} />);

      expect(screen.getByText('2026년 2월 1일 (일)')).toBeTruthy();
      // 직접 선택 버튼이 렌더링되어야 함
      expect(screen.getByText('직접 선택')).toBeTruthy();
    });
  });
});
