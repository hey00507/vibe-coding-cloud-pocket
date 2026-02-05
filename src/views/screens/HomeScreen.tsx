import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { HomeScreenProps } from '../../types/navigation';
import { Transaction, TransactionType, DailySummary, Category, PaymentMethod } from '../../types';
import { TransactionService } from '../../services/TransactionService';
import { CategoryService } from '../../services/CategoryService';
import { PaymentMethodService } from '../../services/PaymentMethodService';
import TransactionItem from '../components/TransactionItem';
import SummaryCard from '../components/SummaryCard';
import ViewToggle, { ViewMode } from '../components/ViewToggle';
import CalendarHeader from '../components/CalendarHeader';
import CalendarGrid from '../components/CalendarGrid';
import DayDetailModal from '../components/DayDetailModal';

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

  // 캘린더 뷰 상태
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

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

    // 캘린더용 데이터
    setDailySummaries(transactionService.getDailySummaries(currentYear, currentMonth));
    setCategories(categoryService.getAll());
    setPaymentMethods(paymentMethodService.getAll());
  }, [currentYear, currentMonth]);

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

  // 캘린더 네비게이션
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // 날짜 선택
  const handleDayPress = (date: Date) => {
    const dayTransactions = transactionService.getByDate(date);
    setSelectedDate(date);
    setSelectedTransactions(dayTransactions);
    setModalVisible(true);
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

  // 월별 요약 계산
  const monthlyIncome = dailySummaries.reduce((sum, s) => sum + s.totalIncome, 0);
  const monthlyExpense = dailySummaries.reduce((sum, s) => sum + s.totalExpense, 0);
  const monthlyBalance = monthlyIncome - monthlyExpense;

  return (
    <View style={styles.container}>
      <ViewToggle view={viewMode} onViewChange={setViewMode} />

      {viewMode === 'list' ? (
        // 리스트 뷰
        <>
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
        </>
      ) : (
        // 캘린더 뷰
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <CalendarHeader
            year={currentYear}
            month={currentMonth}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />

          {/* 월별 요약 */}
          <View style={styles.monthlySummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>수입</Text>
              <Text style={styles.incomeText}>+{monthlyIncome.toLocaleString()}원</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>지출</Text>
              <Text style={styles.expenseText}>-{monthlyExpense.toLocaleString()}원</Text>
            </View>
            <View style={[styles.summaryRow, styles.balanceRow]}>
              <Text style={styles.summaryLabel}>잔액</Text>
              <Text style={[
                styles.balanceText,
                monthlyBalance >= 0 ? styles.incomeText : styles.expenseText
              ]}>
                {monthlyBalance >= 0 ? '+' : ''}{monthlyBalance.toLocaleString()}원
              </Text>
            </View>
          </View>

          <CalendarGrid
            year={currentYear}
            month={currentMonth}
            dailySummaries={dailySummaries}
            onDayPress={handleDayPress}
          />
        </ScrollView>
      )}

      {/* 날짜 상세 모달 */}
      <DayDetailModal
        visible={modalVisible}
        date={selectedDate}
        transactions={selectedTransactions}
        categories={categories}
        paymentMethods={paymentMethods}
        onClose={() => setModalVisible(false)}
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
  // 캘린더 스타일
  monthlySummary: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  balanceRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 8,
    paddingTop: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  incomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  expenseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
  },
  balanceText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
