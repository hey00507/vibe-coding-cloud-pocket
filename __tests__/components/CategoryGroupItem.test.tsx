import React from 'react';
import { render, screen, fireEvent } from '../test-utils';
import CategoryGroupItem from '../../src/views/components/CategoryGroupItem';
import { Category, SubCategory } from '../../src/types';

describe('CategoryGroupItem', () => {
  const mockCategory: Category = {
    id: 'cat-1',
    name: '식비',
    type: 'expense',
    icon: '🍔',
  };

  const mockSubCategories: SubCategory[] = [
    { id: 'sub-1', categoryId: 'cat-1', name: '외식', icon: '🍽️' },
    { id: 'sub-2', categoryId: 'cat-1', name: '간식/카페', icon: '☕' },
  ];

  const defaultProps = {
    category: mockCategory,
    subCategories: mockSubCategories,
    expanded: false,
    onToggle: jest.fn(),
    onDeleteCategory: jest.fn(),
    onDeleteSubCategory: jest.fn(),
    onAddSubCategory: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('collapsed state', () => {
    it('should render category name and icon', () => {
      render(<CategoryGroupItem {...defaultProps} />);

      expect(screen.getByText('🍔')).toBeTruthy();
      expect(screen.getByText('식비')).toBeTruthy();
    });

    it('should show sub-category count', () => {
      render(<CategoryGroupItem {...defaultProps} />);

      expect(screen.getByText('(2)')).toBeTruthy();
    });

    it('should show collapsed indicator', () => {
      render(<CategoryGroupItem {...defaultProps} />);

      expect(screen.getByText('▶')).toBeTruthy();
    });

    it('should not show sub-categories when collapsed', () => {
      render(<CategoryGroupItem {...defaultProps} />);

      expect(screen.queryByText('외식')).toBeNull();
      expect(screen.queryByText('간식/카페')).toBeNull();
    });

    it('should call onToggle when header is pressed', () => {
      render(<CategoryGroupItem {...defaultProps} />);

      fireEvent.press(screen.getByText('식비'));

      expect(defaultProps.onToggle).toHaveBeenCalled();
    });
  });

  describe('expanded state', () => {
    it('should show expanded indicator', () => {
      render(<CategoryGroupItem {...defaultProps} expanded={true} />);

      expect(screen.getByText('▼')).toBeTruthy();
    });

    it('should show sub-categories when expanded', () => {
      render(<CategoryGroupItem {...defaultProps} expanded={true} />);

      expect(screen.getByText('외식')).toBeTruthy();
      expect(screen.getByText('간식/카페')).toBeTruthy();
    });

    it('should show sub-category icons', () => {
      render(<CategoryGroupItem {...defaultProps} expanded={true} />);

      expect(screen.getByText('🍽️')).toBeTruthy();
      expect(screen.getByText('☕')).toBeTruthy();
    });

    it('should show add sub-category button', () => {
      render(<CategoryGroupItem {...defaultProps} expanded={true} />);

      expect(screen.getByText('+ 소분류 추가')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onDeleteCategory when delete button is pressed', () => {
      render(<CategoryGroupItem {...defaultProps} />);

      fireEvent.press(screen.getByText('삭제'));

      expect(defaultProps.onDeleteCategory).toHaveBeenCalledWith('cat-1', '식비');
    });

    it('should call onDeleteSubCategory when sub-category delete is pressed', () => {
      render(<CategoryGroupItem {...defaultProps} expanded={true} />);

      const deleteButtons = screen.getAllByText('삭제');
      // First one is category delete, rest are sub-category deletes
      fireEvent.press(deleteButtons[1]);

      expect(defaultProps.onDeleteSubCategory).toHaveBeenCalledWith('sub-1', '외식');
    });

    it('should call onAddSubCategory when add button is pressed', () => {
      render(<CategoryGroupItem {...defaultProps} expanded={true} />);

      fireEvent.press(screen.getByText('+ 소분류 추가'));

      expect(defaultProps.onAddSubCategory).toHaveBeenCalledWith('cat-1');
    });
  });

  describe('edge cases', () => {
    it('should show (0) when no sub-categories exist', () => {
      render(
        <CategoryGroupItem {...defaultProps} subCategories={[]} expanded={true} />
      );

      expect(screen.getByText('(0)')).toBeTruthy();
    });

    it('should use default icon when category has no icon', () => {
      const catWithoutIcon = { ...mockCategory, icon: undefined };
      render(
        <CategoryGroupItem {...defaultProps} category={catWithoutIcon} />
      );

      expect(screen.getByText('📁')).toBeTruthy();
    });

    it('should use default icon when sub-category has no icon', () => {
      const subsWithoutIcon: SubCategory[] = [
        { id: 'sub-1', categoryId: 'cat-1', name: '기타' },
      ];
      render(
        <CategoryGroupItem
          {...defaultProps}
          subCategories={subsWithoutIcon}
          expanded={true}
        />
      );

      expect(screen.getByText('📋')).toBeTruthy();
    });
  });
});
