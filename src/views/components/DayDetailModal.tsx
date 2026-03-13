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
import { useTheme } from '../../controllers/useTheme';

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
  const { theme } = useTheme();

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
    <View style={[styles.transactionItem, { borderBottomColor: theme.colors.borderLight }]}>
      <View style={styles.transactionLeft}>
        <Text style={styles.categoryIcon}>{getCategoryIcon(item.categoryId)}</Text>
        <View>
          <Text style={[styles.categoryName, { color: theme.colors.text }]}>{getCategoryName(item.categoryId)}</Text>
          <Text style={[styles.paymentMethod, { color: theme.colors.textSecondary }]}>
            {getPaymentMethodName(item.paymentMethodId)}
          </Text>
          {item.memo && <Text style={[styles.memo, { color: theme.colors.textTertiary }]}>{item.memo}</Text>}
        </View>
      </View>
      <Text
        style={[
          styles.amount,
          { color: item.type === 'income' ? theme.colors.income : theme.colors.expense },
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
      <View style={[styles.overlay, { backgroundColor: theme.colors.modalOverlay }]}>
        <View style={[styles.container, { backgroundColor: theme.colors.modalBackground }]}>
          <View style={[styles.header, { borderBottomColor: theme.colors.borderLight }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{formatDate(date)}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeText, { color: theme.colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {transactions.length > 0 ? (
            <FlatList
              data={transactions}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id}
              style={styles.list}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.textTertiary }]}>거래 내역이 없습니다</Text>
            </View>
          )}

          {transactions.length > 0 && (
            <View style={[styles.summary, { borderTopColor: theme.colors.borderLight, backgroundColor: theme.colors.surfaceVariant }]}>
              <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>일일 합계</Text>
              <Text
                style={[
                  styles.summaryAmount,
                  { color: dailyBalance >= 0 ? theme.colors.income : theme.colors.expense },
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
    justifyContent: 'flex-end',
  },
  container: {
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
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 18,
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
  },
  paymentMethod: {
    fontSize: 12,
    marginTop: 2,
  },
  memo: {
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
});

export default DayDetailModal;
