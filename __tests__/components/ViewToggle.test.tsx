import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ViewToggle from '../../src/views/components/ViewToggle';

describe('ViewToggle', () => {
  const mockOnViewChange = jest.fn();

  beforeEach(() => {
    mockOnViewChange.mockClear();
  });

  describe('rendering', () => {
    it('should render list and calendar buttons', () => {
      render(<ViewToggle view="list" onViewChange={mockOnViewChange} />);

      expect(screen.getByText('리스트')).toBeTruthy();
      expect(screen.getByText('캘린더')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onViewChange with "list" when list button is pressed', () => {
      render(<ViewToggle view="calendar" onViewChange={mockOnViewChange} />);

      fireEvent.press(screen.getByText('리스트'));

      expect(mockOnViewChange).toHaveBeenCalledWith('list');
    });

    it('should call onViewChange with "calendar" when calendar button is pressed', () => {
      render(<ViewToggle view="list" onViewChange={mockOnViewChange} />);

      fireEvent.press(screen.getByText('캘린더'));

      expect(mockOnViewChange).toHaveBeenCalledWith('calendar');
    });
  });
});
