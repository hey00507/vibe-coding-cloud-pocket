import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SummaryCardProps {
  balance: number;
  totalIncome: number;
  totalExpense: number;
}

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('ko-KR') + '원';
};

export default function SummaryCard({
  balance,
  totalIncome,
  totalExpense,
}: SummaryCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>잔액</Text>
        <Text
          style={[styles.balanceAmount, balance < 0 && styles.negativeBalance]}
        >
          {formatCurrency(balance)}
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.detailsSection}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>수입</Text>
          <Text style={[styles.detailAmount, styles.incomeAmount]}>
            +{formatCurrency(totalIncome)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>지출</Text>
          <Text style={[styles.detailAmount, styles.expenseAmount]}>
            -{formatCurrency(totalExpense)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2196F3',
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
  negativeBalance: {
    color: '#FFCDD2',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
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
  incomeAmount: {
    color: '#A5D6A7',
  },
  expenseAmount: {
    color: '#FFCDD2',
  },
});
