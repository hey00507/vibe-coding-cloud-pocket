import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';
import { useTheme } from '../../controllers/useTheme';

export interface MonthlyBarData {
  month: number;
  label: string;
  income: number;
  savings: number;
  expense: number;
}

interface GroupedBarChartProps {
  data: MonthlyBarData[];
  height?: number;
  barColors?: {
    income: string;
    savings: string;
    expense: string;
  };
}

const BAR_WIDTH = 8;
const BAR_GAP = 2;
const GROUP_GAP = 16;
const PADDING_LEFT = 45;
const PADDING_BOTTOM = 25;
const PADDING_TOP = 10;

const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
  data,
  height = 200,
  barColors,
}) => {
  const { theme } = useTheme();

  const resolvedColors = barColors || {
    income: theme.colors.income,
    savings: theme.colors.primary,
    expense: theme.colors.expense,
  };

  const hasData = data.length > 0 && data.some(
    (d) => d.income > 0 || d.savings > 0 || d.expense > 0
  );

  if (!hasData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}>
        <Text style={[styles.emptyText, { color: theme.colors.textTertiary }]}>데이터가 없습니다</Text>
      </View>
    );
  }

  const maxValue = Math.max(
    ...data.flatMap((d) => [d.income, d.savings, d.expense])
  );
  const chartHeight = height - PADDING_BOTTOM - PADDING_TOP;
  const groupWidth = BAR_WIDTH * 3 + BAR_GAP * 2 + GROUP_GAP;
  const svgWidth = PADDING_LEFT + data.length * groupWidth + GROUP_GAP;

  const scaleY = (value: number): number => {
    return (value / maxValue) * chartHeight;
  };

  const formatYLabel = (value: number): string => {
    if (value >= 10000) {
      return `${Math.round(value / 10000)}만`;
    }
    return String(value);
  };

  // Y축 눈금 (4단계)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) =>
    Math.round(maxValue * ratio)
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Svg
          testID="bar-chart-svg"
          width={svgWidth}
          height={height}
        >
          {/* Y축 눈금선 및 라벨 */}
          {yTicks.map((tick, i) => {
            const y = PADDING_TOP + chartHeight - scaleY(tick);
            return (
              <React.Fragment key={`ytick-${i}`}>
                <Line
                  x1={PADDING_LEFT}
                  y1={y}
                  x2={svgWidth}
                  y2={y}
                  stroke={theme.colors.borderLight}
                  strokeWidth={1}
                />
                <SvgText
                  x={PADDING_LEFT - 5}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={9}
                  fill={theme.colors.textTertiary}
                >
                  {formatYLabel(tick)}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* 바 그룹 */}
          {data.map((item, index) => {
            const groupX = PADDING_LEFT + GROUP_GAP / 2 + index * groupWidth;
            const incomeH = scaleY(item.income);
            const savingsH = scaleY(item.savings);
            const expenseH = scaleY(item.expense);
            const baseY = PADDING_TOP + chartHeight;

            return (
              <React.Fragment key={item.month}>
                {/* 수입 바 */}
                <Rect
                  testID={`bar-income-${index}`}
                  x={groupX}
                  y={baseY - incomeH}
                  width={BAR_WIDTH}
                  height={incomeH}
                  fill={resolvedColors.income}
                  rx={2}
                />
                {/* 저축 바 */}
                <Rect
                  testID={`bar-savings-${index}`}
                  x={groupX + BAR_WIDTH + BAR_GAP}
                  y={baseY - savingsH}
                  width={BAR_WIDTH}
                  height={savingsH}
                  fill={resolvedColors.savings}
                  rx={2}
                />
                {/* 지출 바 */}
                <Rect
                  testID={`bar-expense-${index}`}
                  x={groupX + (BAR_WIDTH + BAR_GAP) * 2}
                  y={baseY - expenseH}
                  width={BAR_WIDTH}
                  height={expenseH}
                  fill={resolvedColors.expense}
                  rx={2}
                />
                {/* 월 라벨 */}
                <SvgText
                  x={groupX + (BAR_WIDTH * 3 + BAR_GAP * 2) / 2}
                  y={baseY + 15}
                  textAnchor="middle"
                  fontSize={10}
                  fill={theme.colors.textSecondary}
                >
                  {item.label}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </ScrollView>

      {/* 범례 */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            testID="legend-income"
            style={[styles.legendDot, { backgroundColor: resolvedColors.income }]}
          />
          <Text style={[styles.legendLabel, { color: theme.colors.textSecondary }]}>수입</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            testID="legend-savings"
            style={[styles.legendDot, { backgroundColor: resolvedColors.savings }]}
          />
          <Text style={[styles.legendLabel, { color: theme.colors.textSecondary }]}>저축</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            testID="legend-expense"
            style={[styles.legendDot, { backgroundColor: resolvedColors.expense }]}
          />
          <Text style={[styles.legendLabel, { color: theme.colors.textSecondary }]}>지출</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendLabel: {
    fontSize: 12,
  },
});

export default GroupedBarChart;
