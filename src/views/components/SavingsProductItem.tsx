import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SavingsProduct } from '../../types';
import { useTheme } from '../../controllers/useTheme';

interface SavingsProductItemProps {
  product: SavingsProduct;
  onDelete: (id: string, name: string) => void;
}

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('ko-KR') + '원';
};

export default function SavingsProductItem({
  product,
  onDelete,
}: SavingsProductItemProps) {
  const { theme } = useTheme();

  const statusLabel = product.status === 'active' ? '운용중' : '대기';
  const statusColor = product.status === 'active' ? theme.colors.income : theme.colors.warning;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}>
      <View style={styles.header}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: theme.colors.text }]}>{product.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={[styles.statusText, { color: theme.colors.cardBackground }]}>{statusLabel}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: theme.colors.expenseLight }]}
          onPress={() => onDelete(product.id, product.name)}
        >
          <Text style={[styles.deleteText, { color: theme.colors.expense }]}>삭제</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>은행</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>{product.bank}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>금리</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>{product.interestRate}%</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>월 납입액</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>{formatCurrency(product.monthlyAmount)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>납입 개월</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>{product.paidMonths}개월</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>현재 잔액</Text>
          <Text style={[styles.detailValue, { color: theme.colors.primary, fontWeight: '700' }]}>
            {formatCurrency(product.currentAmount)}
          </Text>
        </View>
      </View>

      {product.memo && (
        <Text style={[styles.memo, { color: theme.colors.textTertiary }]}>{product.memo}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteText: {
    fontSize: 14,
  },
  details: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  memo: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
