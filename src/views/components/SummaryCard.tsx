import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../controllers/useTheme';

interface SummaryCardProps {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  totalSavings?: number;
  savingsRate?: number;
  remainingCash?: number;
}

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('ko-KR') + '원';
};

export default function SummaryCard({
  balance,
  totalIncome,
  totalExpense,
  totalSavings,
  savingsRate,
  remainingCash,
}: SummaryCardProps) {
  const { theme } = useTheme();
  const showExtended = totalSavings !== undefined && totalSavings > 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>잔액</Text>
        <Text
          style={[styles.balanceAmount, balance < 0 && { color: theme.colors.expenseSoft }]}
        >
          {formatCurrency(balance)}
        </Text>
      </View>
      <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
      <View style={styles.detailsSection}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>수입</Text>
          <Text style={[styles.detailAmount, { color: theme.colors.incomeSoft }]}>
            +{formatCurrency(totalIncome)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>지출</Text>
          <Text style={[styles.detailAmount, { color: theme.colors.expenseSoft }]}>
            -{formatCurrency(totalExpense)}
          </Text>
        </View>
      </View>
      {showExtended && (
        <>
          <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
          <View style={styles.detailsSection}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>저축</Text>
              <Text style={[styles.detailAmount, styles.savingsAmount]}>
                {formatCurrency(totalSavings!)}
              </Text>
            </View>
            {savingsRate !== undefined && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>저축률</Text>
                <Text style={[styles.detailAmount, styles.savingsAmount]}>
                  {savingsRate}%
                </Text>
              </View>
            )}
            {remainingCash !== undefined && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>잔여현금</Text>
                <Text
                  style={[
                    styles.detailAmount,
                    { color: remainingCash >= 0 ? theme.colors.incomeSoft : theme.colors.expenseSoft },
                  ]}
                >
                  {formatCurrency(remainingCash)}
                </Text>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  balanceSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  detailsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  detailAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  savingsAmount: {
    color: '#90CAF9',
  },
});
