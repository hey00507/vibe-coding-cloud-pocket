import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
  const totalTarget = items.reduce((sum, item) => sum + item.targetAmount, 0);
  const totalActual = items.reduce((sum, item) => sum + item.actualAmount, 0);
  const achievementRate = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>수입 목표/실적</Text>

      {items.length === 0 ? (
        <Text style={styles.emptyText}>수입 목표가 없습니다</Text>
      ) : (
        <>
          {/* 헤더 */}
          <View style={styles.headerRow}>
            <Text style={[styles.headerText, styles.categoryCol]}>카테고리</Text>
            <Text style={[styles.headerText, styles.amountCol]}>목표</Text>
            <Text style={[styles.headerText, styles.amountCol]}>실적</Text>
            <Text style={[styles.headerText, styles.rateCol]}>달성률</Text>
          </View>

          {/* 항목 */}
          {items.map((item, index) => {
            const rate = item.targetAmount > 0
              ? Math.round((item.actualAmount / item.targetAmount) * 100)
              : 0;
            return (
              <View key={index} style={styles.dataRow}>
                <Text style={[styles.dataText, styles.categoryCol]}>{item.categoryName}</Text>
                <Text style={[styles.dataText, styles.amountCol]}>
                  {formatCurrency(item.targetAmount)}
                </Text>
                <Text style={[styles.dataText, styles.amountCol, item.actualAmount >= item.targetAmount ? styles.successText : styles.warningText]}>
                  {formatCurrency(item.actualAmount)}
                </Text>
                <Text style={[styles.dataText, styles.rateCol, rate >= 100 ? styles.successText : styles.warningText]}>
                  {rate}%
                </Text>
              </View>
            );
          })}

          {/* 합계 */}
          <View style={styles.totalRow}>
            <Text style={[styles.totalText, styles.categoryCol]}>합계</Text>
            <Text style={[styles.totalText, styles.amountCol]}>
              {formatCurrency(totalTarget)}
            </Text>
            <Text style={[styles.totalText, styles.amountCol]}>
              {formatCurrency(totalActual)}
            </Text>
            <Text style={[styles.totalText, styles.rateCol, achievementRate >= 100 ? styles.successText : styles.warningText]}>
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
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  headerRow: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 4,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dataText: {
    fontSize: 13,
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 2,
    borderTopColor: '#E0E0E0',
  },
  totalText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
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
  successText: {
    color: '#4CAF50',
  },
  warningText: {
    color: '#FF9800',
  },
});
