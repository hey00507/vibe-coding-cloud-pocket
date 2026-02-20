import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MonthlyCategoryMatrix, PeriodSummary } from '../../types';

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
    <View style={styles.container}>
      <Text style={styles.title}>{year}년 연간 대시보드</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View>
          {/* 헤더 행 */}
          <View style={styles.row}>
            <Text style={[styles.cell, styles.headerCell, styles.labelCell]}>항목</Text>
            {MONTH_LABELS.map((label) => (
              <Text key={label} style={[styles.cell, styles.headerCell]}>{label}</Text>
            ))}
            <Text style={[styles.cell, styles.headerCell]}>합계</Text>
          </View>

          {/* 총 수입 */}
          <View style={styles.row}>
            <Text style={[styles.cell, styles.labelCell, styles.incomeLabel]}>총 수입</Text>
            {monthlyIncomes.map((v, i) => (
              <Text key={i} style={[styles.cell, styles.incomeText]}>{formatAmount(v)}</Text>
            ))}
            <Text style={[styles.cell, styles.incomeText, styles.totalCell]}>{formatAmount(totalIncome)}</Text>
          </View>

          {/* 총 저축 */}
          <View style={styles.row}>
            <Text style={[styles.cell, styles.labelCell, styles.savingsLabel]}>총 저축</Text>
            {monthlySavingsArr.map((v: number, i: number) => (
              <Text key={i} style={[styles.cell, styles.savingsText]}>{formatAmount(v)}</Text>
            ))}
            <Text style={[styles.cell, styles.savingsText, styles.totalCell]}>{formatAmount(totalSavingsSum)}</Text>
          </View>

          {/* 총 지출 */}
          <View style={styles.row}>
            <Text style={[styles.cell, styles.labelCell, styles.expenseLabel]}>총 지출</Text>
            {monthlyExpenses.map((v, i) => (
              <Text key={i} style={[styles.cell, styles.expenseText]}>{formatAmount(v)}</Text>
            ))}
            <Text style={[styles.cell, styles.expenseText, styles.totalCell]}>{formatAmount(totalExpense)}</Text>
          </View>

          {/* 잉여금액 */}
          <View style={[styles.row, styles.remainingRow]}>
            <Text style={[styles.cell, styles.labelCell, styles.remainingLabel]}>잉여금액</Text>
            {monthlyRemaining.map((v, i) => (
              <Text key={i} style={[styles.cell, v >= 0 ? styles.incomeText : styles.expenseText]}>{formatAmount(v)}</Text>
            ))}
            <Text style={[styles.cell, totalRemaining >= 0 ? styles.incomeText : styles.expenseText, styles.totalCell]}>
              {formatAmount(totalRemaining)}
            </Text>
          </View>

          {/* 카테고리별 지출 */}
          {categoryMatrix.map((cat) => (
            <View key={cat.categoryId} style={styles.row}>
              <Text style={[styles.cell, styles.labelCell]} numberOfLines={1}>{cat.categoryName}</Text>
              {cat.monthlyAmounts.map((v, i) => (
                <Text key={i} style={styles.cell}>{formatAmount(v)}</Text>
              ))}
              <Text style={[styles.cell, styles.totalCell]}>{formatAmount(cat.total)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  remainingRow: {
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
    marginBottom: 4,
  },
  cell: {
    width: 60,
    paddingVertical: 8,
    paddingHorizontal: 4,
    fontSize: 11,
    textAlign: 'right',
    color: '#333',
  },
  headerCell: {
    fontWeight: '600',
    backgroundColor: '#F5F5F5',
    color: '#555',
    textAlign: 'center',
  },
  labelCell: {
    width: 80,
    textAlign: 'left',
    fontWeight: '500',
  },
  totalCell: {
    fontWeight: '700',
    backgroundColor: '#FAFAFA',
  },
  incomeLabel: {
    color: '#4CAF50',
  },
  incomeText: {
    color: '#4CAF50',
  },
  savingsLabel: {
    color: '#2196F3',
  },
  savingsText: {
    color: '#2196F3',
  },
  expenseLabel: {
    color: '#F44336',
  },
  expenseText: {
    color: '#F44336',
  },
  remainingLabel: {
    color: '#FF9800',
    fontWeight: '600',
  },
});
