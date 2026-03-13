import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../controllers/useTheme';

export interface IncomeComparisonItem {
  categoryName: string;
  targetAmount: number;
  actualAmount: number;
}

interface IncomeSummaryCardProps {
  items: IncomeComparisonItem[];
}

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('ko-KR') + '원';
};

export default function IncomeSummaryCard({ items }: IncomeSummaryCardProps) {
  const { theme } = useTheme();

  const totalTarget = items.reduce((sum, item) => sum + item.targetAmount, 0);
  const totalActual = items.reduce((sum, item) => sum + item.actualAmount, 0);
  const achievementRate = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>수입 목표/실적</Text>

      {items.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.colors.textTertiary }]}>수입 목표가 없습니다</Text>
      ) : (
        <>
          {/* 헤더 */}
          <View style={[styles.headerRow, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.headerText, styles.categoryCol, { color: theme.colors.textSecondary }]}>카테고리</Text>
            <Text style={[styles.headerText, styles.amountCol, { color: theme.colors.textSecondary }]}>목표</Text>
            <Text style={[styles.headerText, styles.amountCol, { color: theme.colors.textSecondary }]}>실적</Text>
            <Text style={[styles.headerText, styles.rateCol, { color: theme.colors.textSecondary }]}>달성률</Text>
          </View>

          {/* 항목 */}
          {items.map((item, index) => {
            const rate = item.targetAmount > 0
              ? Math.round((item.actualAmount / item.targetAmount) * 100)
              : 0;
            return (
              <View key={index} style={[styles.dataRow, { borderBottomColor: theme.colors.borderLight }]}>
                <Text style={[styles.dataText, styles.categoryCol, { color: theme.colors.text }]}>{item.categoryName}</Text>
                <Text style={[styles.dataText, styles.amountCol, { color: theme.colors.text }]}>
                  {formatCurrency(item.targetAmount)}
                </Text>
                <Text style={[styles.dataText, styles.amountCol, { color: item.actualAmount >= item.targetAmount ? theme.colors.income : theme.colors.warning }]}>
                  {formatCurrency(item.actualAmount)}
                </Text>
                <Text style={[styles.dataText, styles.rateCol, { color: rate >= 100 ? theme.colors.income : theme.colors.warning }]}>
                  {rate}%
                </Text>
              </View>
            );
          })}

          {/* 합계 */}
          <View style={[styles.totalRow, { borderTopColor: theme.colors.border }]}>
            <Text style={[styles.totalText, styles.categoryCol, { color: theme.colors.text }]}>합계</Text>
            <Text style={[styles.totalText, styles.amountCol, { color: theme.colors.text }]}>
              {formatCurrency(totalTarget)}
            </Text>
            <Text style={[styles.totalText, styles.amountCol, { color: theme.colors.text }]}>
              {formatCurrency(totalActual)}
            </Text>
            <Text style={[styles.totalText, styles.rateCol, { color: achievementRate >= 100 ? theme.colors.income : theme.colors.warning }]}>
              {achievementRate}%
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  headerRow: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  dataText: {
    fontSize: 13,
  },
  totalRow: {
    flexDirection: 'row',
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 2,
  },
  totalText: {
    fontSize: 14,
    fontWeight: '700',
  },
  categoryCol: {
    flex: 2,
  },
  amountCol: {
    flex: 2,
    textAlign: 'right',
  },
  rateCol: {
    flex: 1,
    textAlign: 'right',
  },
});
