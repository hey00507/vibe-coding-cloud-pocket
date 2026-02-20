import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SavingsProduct } from '../../types';

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
  const statusLabel = product.status === 'active' ? '운용중' : '대기';
  const statusColor = product.status === 'active' ? '#4CAF50' : '#FF9800';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{product.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(product.id, product.name)}
        >
          <Text style={styles.deleteText}>삭제</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>은행</Text>
          <Text style={styles.detailValue}>{product.bank}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>금리</Text>
          <Text style={styles.detailValue}>{product.interestRate}%</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>월 납입액</Text>
          <Text style={styles.detailValue}>{formatCurrency(product.monthlyAmount)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>납입 개월</Text>
          <Text style={styles.detailValue}>{product.paidMonths}개월</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>현재 잔액</Text>
          <Text style={[styles.detailValue, styles.amountText]}>
            {formatCurrency(product.currentAmount)}
          </Text>
        </View>
      </View>

      {product.memo && (
        <Text style={styles.memo}>{product.memo}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
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
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FFEBEE',
  },
  deleteText: {
    fontSize: 14,
    color: '#F44336',
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
    color: '#999',
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  amountText: {
    color: '#2196F3',
    fontWeight: '700',
  },
  memo: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
