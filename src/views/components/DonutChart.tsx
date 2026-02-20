import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

export interface DonutChartSegment {
  id: string;
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutChartSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
}

const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  size = 200,
  strokeWidth = 30,
  centerLabel,
  centerValue,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  if (segments.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.chartWrapper}>
          <Svg width={size} height={size} testID="donut-svg">
            <Circle
              testID="donut-empty-circle"
              cx={center}
              cy={center}
              r={radius}
              stroke="#E0E0E0"
              strokeWidth={strokeWidth}
              fill="none"
            />
          </Svg>
        </View>
        <Text style={styles.emptyText}>데이터가 없습니다</Text>
      </View>
    );
  }

  let cumulativePercentage = 0;

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <Svg width={size} height={size} testID="donut-svg">
          {/* 배경 원 */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#F0F0F0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* 세그먼트 */}
          {segments.map((segment, index) => {
            const dashArray = circumference;
            const dashOffset =
              circumference - (circumference * segment.percentage) / 100;
            const rotation = (cumulativePercentage / 100) * 360 - 90;
            cumulativePercentage += segment.percentage;

            return (
              <Circle
                key={segment.id}
                testID={`donut-segment-${index}`}
                cx={center}
                cy={center}
                r={radius}
                stroke={segment.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${dashArray}`}
                strokeDashoffset={`${dashOffset}`}
                strokeLinecap="butt"
                rotation={rotation}
                origin={`${center}, ${center}`}
              />
            );
          })}
          {/* 중앙 텍스트 */}
          {centerLabel && (
            <SvgText
              testID="donut-center-label"
              x={center}
              y={center - 8}
              textAnchor="middle"
              fontSize={12}
              fill="#999"
            >
              {centerLabel}
            </SvgText>
          )}
          {centerValue && (
            <SvgText
              testID="donut-center-value"
              x={center}
              y={center + 12}
              textAnchor="middle"
              fontSize={14}
              fontWeight="bold"
              fill="#333"
            >
              {centerValue}
            </SvgText>
          )}
        </Svg>
      </View>
      {/* 범례 */}
      <View style={styles.legend}>
        {segments.map((segment, index) => (
          <View key={segment.id} style={styles.legendItem}>
            <View
              testID={`legend-color-${index}`}
              style={[styles.legendDot, { backgroundColor: segment.color }]}
            />
            <Text style={styles.legendLabel}>{segment.label}</Text>
            <Text style={styles.legendPercentage}>{segment.percentage}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  chartWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 10,
  },
  legend: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  legendPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
});

export default DonutChart;
