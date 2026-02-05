import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Transaction, Category, PaymentMethod } from '../../types';

interface DayDetailModalProps {
  visible: boolean;
  date: Date | null;
  transactions: Transaction[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
  onClose: () => void;
}

const DayDetailModal: React.FC<DayDetailModalProps> = ({
  visible,
  date,
  transactions,
  categories,
  paymentMethods,
  onClose,
}) => {
  const formatDate = (d: Date): string => {
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[d.getDay()];
    return `${month}월 ${day}일 (${weekday})`;
  };

  const formatAmount = (amount: number, type: 'income' | 'expense'): string => {
    const prefix = type === 'income' ? '+' : '-';
    return `${prefix}${amount.toLocaleString()}원`;
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || '기타';
  };

  const getCategoryIcon = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.icon || '';
  };

  const getPaymentMethodName = (paymentMethodId: string): string => {
    const method = paymentMethods.find((p) => p.id === paymentMethodId);
    return method?.name || '기타';
  };

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const dailyBalance = totalIncome - totalExpense;

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <Text style={styles.categoryIcon}>{getCategoryIcon(item.categoryId)}</Text>
        <View>
          <Text style={styles.categoryName}>{getCategoryName(item.categoryId)}</Text>
          <Text style={styles.paymentMethod}>
            {getPaymentMethodName(item.paymentMethodId)}
          </Text>
          {item.memo && <Text style={styles.memo}>{item.memo}</Text>}
        </View>
      </View>
      <Text
        style={[
          styles.amount,
          item.type === 'income' ? styles.incomeAmount : styles.expenseAmount,
        ]}
      >
        {formatAmount(item.amount, item.type)}
      </Text>
    </View>
  );

  if (!date) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.title}>{formatDate(date)}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 거래 목록 */}
          {transactions.length > 0 ? (
            <FlatList
              data={transactions}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id}
              style={styles.list}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>거래 내역이 없습니다</Text>
            </View>
          )}

          {/* 일일 합계 */}
          {transactions.length > 0 && (
            <View style={styles.summary}>
              <Text style={styles.summaryLabel}>일일 합계</Text>
              <Text
                style={[
                  styles.summaryAmount,
                  dailyBalance >= 0 ? styles.incomeAmount : styles.expenseAmount,
                ]}
              >
                {dailyBalance >= 0 ? '+' : ''}
                {dailyBalance.toLocaleString()}원
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 18,
    color: '#666',
  },
  list: {
    paddingHorizontal: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  paymentMethod: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  memo: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  incomeAmount: {
    color: '#4CAF50',
  },
  expenseAmount: {
    color: '#F44336',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
});

export default DayDetailModal;
