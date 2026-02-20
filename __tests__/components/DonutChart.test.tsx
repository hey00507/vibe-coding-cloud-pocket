import React from 'react';
import { render, screen } from '@testing-library/react-native';
import DonutChart, { DonutChartSegment } from '../../src/views/components/DonutChart';

const sampleSegments: DonutChartSegment[] = [
  { id: '1', label: '식비', value: 50000, percentage: 50, color: '#FF6384' },
  { id: '2', label: '교통비', value: 30000, percentage: 30, color: '#36A2EB' },
  { id: '3', label: '여가', value: 20000, percentage: 20, color: '#FFCE56' },
];

describe('DonutChart', () => {
  describe('empty state', () => {
    it('should render empty state when segments is empty', () => {
      render(<DonutChart segments={[]} />);
      expect(screen.getByText('데이터가 없습니다')).toBeTruthy();
    });

    it('should render empty circle in empty state', () => {
      render(<DonutChart segments={[]} />);
      expect(screen.getByTestId('donut-empty-circle')).toBeTruthy();
    });
  });

  describe('rendering with data', () => {
    it('should render SVG container', () => {
      render(<DonutChart segments={sampleSegments} />);
      expect(screen.getByTestId('donut-svg')).toBeTruthy();
    });

    it('should render one segment per data item', () => {
      render(<DonutChart segments={sampleSegments} />);
      expect(screen.getByTestId('donut-segment-0')).toBeTruthy();
      expect(screen.getByTestId('donut-segment-1')).toBeTruthy();
      expect(screen.getByTestId('donut-segment-2')).toBeTruthy();
    });

    it('should render center label when provided', () => {
      render(
        <DonutChart
          segments={sampleSegments}
          centerLabel="총 지출"
          centerValue="100,000원"
        />
      );
      expect(screen.getByText('총 지출')).toBeTruthy();
      expect(screen.getByText('100,000원')).toBeTruthy();
    });

    it('should not render center text when not provided', () => {
      render(<DonutChart segments={sampleSegments} />);
      expect(screen.queryByTestId('donut-center-label')).toBeNull();
      expect(screen.queryByTestId('donut-center-value')).toBeNull();
    });
  });

  describe('legend', () => {
    it('should render legend items for each segment', () => {
      render(<DonutChart segments={sampleSegments} />);
      expect(screen.getByText('식비')).toBeTruthy();
      expect(screen.getByText('교통비')).toBeTruthy();
      expect(screen.getByText('여가')).toBeTruthy();
    });

    it('should display percentage in legend', () => {
      render(<DonutChart segments={sampleSegments} />);
      expect(screen.getByText('50%')).toBeTruthy();
      expect(screen.getByText('30%')).toBeTruthy();
      expect(screen.getByText('20%')).toBeTruthy();
    });

    it('should display colored indicators', () => {
      render(<DonutChart segments={sampleSegments} />);
      expect(screen.getByTestId('legend-color-0')).toBeTruthy();
      expect(screen.getByTestId('legend-color-1')).toBeTruthy();
      expect(screen.getByTestId('legend-color-2')).toBeTruthy();
    });
  });

  describe('props', () => {
    it('should use default size of 200', () => {
      render(<DonutChart segments={sampleSegments} />);
      const svg = screen.getByTestId('donut-svg');
      expect(svg.props.width).toBe(200);
      expect(svg.props.height).toBe(200);
    });

    it('should use custom size when provided', () => {
      render(<DonutChart segments={sampleSegments} size={300} />);
      const svg = screen.getByTestId('donut-svg');
      expect(svg.props.width).toBe(300);
      expect(svg.props.height).toBe(300);
    });

    it('should use default strokeWidth of 30', () => {
      render(<DonutChart segments={sampleSegments} />);
      const segment = screen.getByTestId('donut-segment-0');
      expect(segment.props.strokeWidth).toBe(30);
    });

    it('should use custom strokeWidth when provided', () => {
      render(<DonutChart segments={sampleSegments} strokeWidth={20} />);
      const segment = screen.getByTestId('donut-segment-0');
      expect(segment.props.strokeWidth).toBe(20);
    });
  });

  describe('edge cases', () => {
    it('should handle single segment (full circle)', () => {
      const single: DonutChartSegment[] = [
        { id: '1', label: '식비', value: 100000, percentage: 100, color: '#FF6384' },
      ];
      render(<DonutChart segments={single} />);
      expect(screen.getByTestId('donut-segment-0')).toBeTruthy();
      expect(screen.queryByTestId('donut-segment-1')).toBeNull();
    });

    it('should handle many segments', () => {
      const many: DonutChartSegment[] = Array.from({ length: 10 }, (_, i) => ({
        id: String(i),
        label: `카테고리${i}`,
        value: 10000,
        percentage: 10,
        color: `#${String(i).repeat(6).slice(0, 6)}`,
      }));
      render(<DonutChart segments={many} />);
      for (let i = 0; i < 10; i++) {
        expect(screen.getByTestId(`donut-segment-${i}`)).toBeTruthy();
      }
    });
  });
});
