import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SavingsSummaryCardProps {
  totalSavings: number;
  monthlySavingsTarget: number;
  activeProductCount: number;
}

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('ko-KR') + '원';
};

export default function SavingsSummaryCard({
  totalSavings,
  monthlySavingsTarget,
  activeProductCount,
}: SavingsSummaryCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>저축 현황</Text>

      <View style={styles.mainAmount}>
        <Text style={styles.mainLabel}>총 저축액</Text>
        <Text style={styles.mainValue}>{formatCurrency(totalSavings)}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>월 저축 목표</Text>
          <Text style={styles.statValue}>{formatCurrency(monthlySavingsTarget)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>운용 상품 수</Text>
          <Text style={styles.statValue}>{activeProductCount}개</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E8F5E9',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 14,
    color: '#388E3C',
    fontWeight: '600',
    marginBottom: 8,
  },
  mainAmount: {
    alignItems: 'center',
    marginBottom: 16,
  },
  mainLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  mainValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2E7D32',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
