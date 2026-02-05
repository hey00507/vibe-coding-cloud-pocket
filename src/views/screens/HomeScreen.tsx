import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { HomeScreenProps } from '../../types/navigation';
import { Transaction, TransactionType } from '../../types';
import { TransactionService } from '../../services/TransactionService';
import { CategoryService } from '../../services/CategoryService';
import { PaymentMethodService } from '../../services/PaymentMethodService';
import TransactionItem from '../components/TransactionItem';
import SummaryCard from '../components/SummaryCard';

const transactionService = new TransactionService();
const categoryService = new CategoryService();
const paymentMethodService = new PaymentMethodService();

// 전역 서비스 인스턴스 export (다른 화면에서 사용)
export { transactionService, categoryService, paymentMethodService };

type FilterType = 'all' | TransactionType;

export default function HomeScreen(_props: HomeScreenProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);

  const loadData = useCallback(() => {
    const allTransactions = transactionService.getAll();
    // 날짜 내림차순 정렬
    const sorted = [...allTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setTransactions(sorted);

    // 요약 데이터도 함께 갱신
    setTotalIncome(transactionService.getTotalIncome());
    setTotalExpense(transactionService.getTotalExpense());
    setBalance(transactionService.getBalance());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
    setRefreshing(false);
  }, [loadData]);

  const filteredTransactions =
    filter === 'all'
      ? transactions
      : transactions.filter((t) => t.type === filter);

  const handleDelete = (id: string) => {
    transactionService.delete(id);
    loadData();
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categoryService.getById(categoryId);
    return category?.name ?? '미분류';
  };

  const getPaymentMethodName = (paymentMethodId: string): string => {
    const method = paymentMethodService.getById(paymentMethodId);
    return method?.name ?? '미지정';
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TransactionItem
      transaction={item}
      categoryName={getCategoryName(item.categoryId)}
      paymentMethodName={getPaymentMethodName(item.paymentMethodId)}
      onDelete={() => handleDelete(item.id)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>거래 내역이 없습니다</Text>
      <Text style={styles.emptySubtext}>
        아래 + 버튼을 눌러 거래를 추가해보세요
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <SummaryCard
        balance={balance}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
      />

      <View style={styles.filterContainer}>
        {(['all', 'income', 'expense'] as FilterType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              filter === type && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(type)}
          >
            <Text
              style={[
                styles.filterText,
                filter === type && styles.filterTextActive,
              ]}
            >
              {type === 'all' ? '전체' : type === 'income' ? '수입' : '지출'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BBB',
  },
});
