import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import PeriodSelector from '../../src/views/components/PeriodSelector';
import { PeriodType } from '../../src/types';

describe('PeriodSelector', () => {
  const defaultProps = {
    periodType: 'monthly' as PeriodType,
    year: 2026,
    month: 2,
    onPeriodTypeChange: jest.fn(),
    onPrev: jest.fn(),
    onNext: jest.fn(),
  };

  beforeEach(() => {
    defaultProps.onPeriodTypeChange.mockClear();
    defaultProps.onPrev.mockClear();
    defaultProps.onNext.mockClear();
  });

  describe('rendering', () => {
    it('should render period type toggle buttons', () => {
      render(<PeriodSelector {...defaultProps} />);

      expect(screen.getByText('월별')).toBeTruthy();
      expect(screen.getByText('연도별')).toBeTruthy();
    });

    it('should display month label in monthly mode', () => {
      render(<PeriodSelector {...defaultProps} />);

      expect(screen.getByText('2026년 2월')).toBeTruthy();
    });

    it('should display year label in yearly mode', () => {
      render(
        <PeriodSelector {...defaultProps} periodType="yearly" />
      );

      expect(screen.getByText('2026년')).toBeTruthy();
    });

    it('should render navigation arrows', () => {
      render(<PeriodSelector {...defaultProps} />);

      expect(screen.getByText('◀')).toBeTruthy();
      expect(screen.getByText('▶')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onPeriodTypeChange with "yearly" when yearly button is pressed', () => {
      render(<PeriodSelector {...defaultProps} periodType="monthly" />);

      fireEvent.press(screen.getByText('연도별'));

      expect(defaultProps.onPeriodTypeChange).toHaveBeenCalledWith('yearly');
    });

    it('should call onPeriodTypeChange with "monthly" when monthly button is pressed', () => {
      render(<PeriodSelector {...defaultProps} periodType="yearly" />);

      fireEvent.press(screen.getByText('월별'));

      expect(defaultProps.onPeriodTypeChange).toHaveBeenCalledWith('monthly');
    });

    it('should call onPrev when left arrow is pressed', () => {
      render(<PeriodSelector {...defaultProps} />);

      fireEvent.press(screen.getByText('◀'));

      expect(defaultProps.onPrev).toHaveBeenCalledTimes(1);
    });

    it('should call onNext when right arrow is pressed', () => {
      render(<PeriodSelector {...defaultProps} />);

      fireEvent.press(screen.getByText('▶'));

      expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
    });
  });
});
