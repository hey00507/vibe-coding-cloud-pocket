import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Transaction } from '../../types';
import { useTheme } from '../../controllers/useTheme';

interface TransactionItemProps {
  transaction: Transaction;
  categoryName: string;
  subCategoryName?: string;
  paymentMethodName: string;
  onDelete: () => void;
}

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('ko-KR') + '원';
};

const formatDate = (date: Date): string => {
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

export default function TransactionItem({
  transaction,
  categoryName,
  subCategoryName,
  paymentMethodName,
  onDelete,
}: TransactionItemProps) {
  const { theme } = useTheme();
  const isExpense = transaction.type === 'expense';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}>
      <View style={styles.leftSection}>
        <View style={styles.header}>
          <Text style={[styles.category, { color: theme.colors.text }]}>
            {subCategoryName ? `${categoryName} > ${subCategoryName}` : categoryName}
          </Text>
          <Text style={[styles.date, { color: theme.colors.textTertiary }]}>{formatDate(transaction.date)}</Text>
        </View>
        <Text style={[styles.paymentMethod, { color: theme.colors.textSecondary }]}>{paymentMethodName}</Text>
        {transaction.memo && (
          <Text style={[styles.memo, { color: theme.colors.textTertiary }]} numberOfLines={1}>
            {transaction.memo}
          </Text>
        )}
      </View>
      <View style={styles.rightSection}>
        <Text
          style={[
            styles.amount,
            { color: isExpense ? theme.colors.expense : theme.colors.income },
          ]}
        >
          {isExpense ? '-' : '+'}
          {formatCurrency(transaction.amount)}
        </Text>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={[styles.deleteText, { color: theme.colors.textTertiary }]}>삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  leftSection: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
  },
  paymentMethod: {
    fontSize: 12,
    marginTop: 4,
  },
  memo: {
    fontSize: 12,
    marginTop: 4,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteText: {
    fontSize: 12,
  },
});
