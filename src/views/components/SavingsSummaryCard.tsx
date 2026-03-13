import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../controllers/useTheme';

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
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.savingsBackground }]}>
      <Text style={[styles.title, { color: theme.colors.savingsTitle }]}>저축 현황</Text>

      <View style={styles.mainAmount}>
        <Text style={[styles.mainLabel, { color: theme.colors.textSecondary }]}>총 저축액</Text>
        <Text style={[styles.mainValue, { color: theme.colors.savingsText }]}>{formatCurrency(totalSavings)}</Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.statItem, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>월 저축 목표</Text>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{formatCurrency(monthlySavingsTarget)}</Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>운용 상품 수</Text>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{activeProductCount}개</Text>
        </View>
      </View>
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
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  mainAmount: {
    alignItems: 'center',
    marginBottom: 16,
  },
  mainLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  mainValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});
