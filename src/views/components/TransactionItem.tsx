import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Transaction } from '../../types';

interface TransactionItemProps {
  transaction: Transaction;
  categoryName: string;
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
  paymentMethodName,
  onDelete,
}: TransactionItemProps) {
  const isExpense = transaction.type === 'expense';

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.header}>
          <Text style={styles.category}>{categoryName}</Text>
          <Text style={styles.date}>{formatDate(transaction.date)}</Text>
        </View>
        <Text style={styles.paymentMethod}>{paymentMethodName}</Text>
        {transaction.memo && (
          <Text style={styles.memo} numberOfLines={1}>
            {transaction.memo}
          </Text>
        )}
      </View>
      <View style={styles.rightSection}>
        <Text
          style={[
            styles.amount,
            isExpense ? styles.expenseAmount : styles.incomeAmount,
          ]}
        >
          {isExpense ? '-' : '+'}
          {formatCurrency(transaction.amount)}
        </Text>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteText}>삭제</Text>
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
    backgroundColor: '#FFF',
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
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  paymentMethod: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  memo: {
    fontSize: 12,
    color: '#999',
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
  incomeAmount: {
    color: '#4CAF50',
  },
  expenseAmount: {
    color: '#F44336',
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteText: {
    fontSize: 12,
    color: '#999',
  },
});
