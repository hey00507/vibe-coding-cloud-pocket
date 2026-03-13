import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MonthlyCategoryMatrix, PeriodSummary } from '../../types';
import { useTheme } from '../../controllers/useTheme';

interface AnnualDashboardProps {
  year: number;
  monthlySummaries: PeriodSummary[];
  categoryMatrix: MonthlyCategoryMatrix[];
  totalSavings?: number[];
}

const MONTH_LABELS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

const formatAmount = (amount: number): string => {
  if (amount === 0) return '-';
  if (amount >= 10000) {
    return Math.round(amount / 10000) + '만';
  }
  return amount.toLocaleString('ko-KR');
};

export default function AnnualDashboard({
  year,
  monthlySummaries,
  categoryMatrix,
  totalSavings,
}: AnnualDashboardProps) {
  const { theme } = useTheme();

  const monthlyIncomes = monthlySummaries.map((s) => s.totalIncome);
  const monthlyExpenses = monthlySummaries.map((s) => s.totalExpense);
  const monthlySavingsArr = totalSavings || new Array(12).fill(0);
  const monthlyRemaining = monthlySummaries.map(
    (s, i) => s.totalIncome - s.totalExpense - monthlySavingsArr[i]
  );

  const totalIncome = monthlyIncomes.reduce((sum, v) => sum + v, 0);
  const totalExpense = monthlyExpenses.reduce((sum, v) => sum + v, 0);
  const totalSavingsSum = monthlySavingsArr.reduce((sum: number, v: number) => sum + v, 0);
  const totalRemaining = totalIncome - totalExpense - totalSavingsSum;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{year}년 연간 대시보드</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View>
          {/* 헤더 행 */}
          <View style={[styles.row, { borderBottomColor: theme.colors.borderLight }]}>
            <Text style={[styles.cell, styles.headerCell, styles.labelCell, { backgroundColor: theme.colors.surface, color: theme.colors.textSecondary }]}>항목</Text>
            {MONTH_LABELS.map((label) => (
              <Text key={label} style={[styles.cell, styles.headerCell, { backgroundColor: theme.colors.surface, color: theme.colors.textSecondary }]}>{label}</Text>
            ))}
            <Text style={[styles.cell, styles.headerCell, { backgroundColor: theme.colors.surface, color: theme.colors.textSecondary }]}>합계</Text>
          </View>

          {/* 총 수입 */}
          <View style={[styles.row, { borderBottomColor: theme.colors.borderLight }]}>
            <Text style={[styles.cell, styles.labelCell, { color: theme.colors.income }]}>총 수입</Text>
            {monthlyIncomes.map((v, i) => (
              <Text key={i} style={[styles.cell, { color: theme.colors.income }]}>{formatAmount(v)}</Text>
            ))}
            <Text style={[styles.cell, styles.totalCell, { color: theme.colors.income, backgroundColor: theme.colors.surfaceVariant }]}>{formatAmount(totalIncome)}</Text>
          </View>

          {/* 총 저축 */}
          <View style={[styles.row, { borderBottomColor: theme.colors.borderLight }]}>
            <Text style={[styles.cell, styles.labelCell, { color: theme.colors.primary }]}>총 저축</Text>
            {monthlySavingsArr.map((v: number, i: number) => (
              <Text key={i} style={[styles.cell, { color: theme.colors.primary }]}>{formatAmount(v)}</Text>
            ))}
            <Text style={[styles.cell, styles.totalCell, { color: theme.colors.primary, backgroundColor: theme.colors.surfaceVariant }]}>{formatAmount(totalSavingsSum)}</Text>
          </View>

          {/* 총 지출 */}
          <View style={[styles.row, { borderBottomColor: theme.colors.borderLight }]}>
            <Text style={[styles.cell, styles.labelCell, { color: theme.colors.expense }]}>총 지출</Text>
            {monthlyExpenses.map((v, i) => (
              <Text key={i} style={[styles.cell, { color: theme.colors.expense }]}>{formatAmount(v)}</Text>
            ))}
            <Text style={[styles.cell, styles.totalCell, { color: theme.colors.expense, backgroundColor: theme.colors.surfaceVariant }]}>{formatAmount(totalExpense)}</Text>
          </View>

          {/* 잉여금액 */}
          <View style={[styles.row, styles.remainingRow, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.cell, styles.labelCell, { color: theme.colors.warning, fontWeight: '600' }]}>잉여금액</Text>
            {monthlyRemaining.map((v, i) => (
              <Text key={i} style={[styles.cell, { color: v >= 0 ? theme.colors.income : theme.colors.expense }]}>{formatAmount(v)}</Text>
            ))}
            <Text style={[styles.cell, styles.totalCell, { color: totalRemaining >= 0 ? theme.colors.income : theme.colors.expense, backgroundColor: theme.colors.surfaceVariant }]}>
              {formatAmount(totalRemaining)}
            </Text>
          </View>

          {/* 카테고리별 지출 */}
          {categoryMatrix.map((cat) => (
            <View key={cat.categoryId} style={[styles.row, { borderBottomColor: theme.colors.borderLight }]}>
              <Text style={[styles.cell, styles.labelCell, { color: theme.colors.text }]} numberOfLines={1}>{cat.categoryName}</Text>
              {cat.monthlyAmounts.map((v, i) => (
                <Text key={i} style={[styles.cell, { color: theme.colors.text }]}>{formatAmount(v)}</Text>
              ))}
              <Text style={[styles.cell, styles.totalCell, { color: theme.colors.text, backgroundColor: theme.colors.surfaceVariant }]}>{formatAmount(cat.total)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  remainingRow: {
    borderBottomWidth: 2,
    marginBottom: 4,
  },
  cell: {
    width: 60,
    paddingVertical: 8,
    paddingHorizontal: 4,
    fontSize: 11,
    textAlign: 'right',
  },
  headerCell: {
    fontWeight: '600',
    textAlign: 'center',
  },
  labelCell: {
    width: 80,
    textAlign: 'left',
    fontWeight: '500',
  },
  totalCell: {
    fontWeight: '700',
  },
});
