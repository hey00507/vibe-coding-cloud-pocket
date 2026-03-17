import React, { useState, useCallback, useEffect } from 'react';
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
import { Transaction, TransactionType, DailySummary, Category, PaymentMethod, BudgetProgress, BudgetStatus } from '../../types';
import {
  transactionService,
  categoryService,
  paymentMethodService,
  subCategoryService,
  budgetService,
} from '../../services/ServiceRegistry';
import TransactionItem from '../components/TransactionItem';
import SummaryCard from '../components/SummaryCard';
import BudgetProgressBar from '../components/BudgetProgressBar';
import ViewToggle, { ViewMode } from '../components/ViewToggle';
import CalendarHeader from '../components/CalendarHeader';
import CalendarGrid from '../components/CalendarGrid';
import DayDetailModal from '../components/DayDetailModal';
import { useTheme } from '../../controllers/useTheme';

// 하위 호환: 기존 HomeScreen에서 서비스를 import하는 코드를 위해 re-export
export { transactionService, categoryService, paymentMethodService, subCategoryService };

type FilterType = 'all' | TransactionType;

export default function HomeScreen({ navigation, route }: HomeScreenProps) {
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);

  // 예산 상태
  const [budgetCollapsed, setBudgetCollapsed] = useState(false);
  const [budgetCategoryProgress, setBudgetCategoryProgress] = useState<BudgetProgress[]>([]);
  const [budgetTotalProgress, setBudgetTotalProgress] = useState<{
    budget: number; spent: number; remaining: number; percentage: number; status: BudgetStatus;
  }>({ budget: 0, spent: 0, remaining: 0, percentage: 0, status: 'safe' });

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

  // 라우트 파라미터 처리 (AddTransactionScreen에서 전달)
  const routeSelectedDate = route.params?.selectedDate;
  useEffect(() => {
    if (!routeSelectedDate) return;

    const [yearStr, monthStr, dayStr] = routeSelectedDate.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    // 캘린더 뷰로 전환
    setViewMode('calendar');
    setCurrentYear(year);
    setCurrentMonth(month);

    // 해당 날짜의 거래 조회 후 DayDetailModal 열기
    const date = new Date(year, month - 1, day);
    const dayTransactions = transactionService.getByDate(date);
    setSelectedDate(date);
    setSelectedTransactions(dayTransactions);
    setModalVisible(true);

    // 파라미터 클리어
    navigation.setParams({ selectedDate: undefined });
  }, [routeSelectedDate, navigation]);

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

    // 예산 데이터
    const now = new Date();
    const budgetYear = now.getFullYear();
    const budgetMonth = now.getMonth() + 1;
    budgetService.copyFromPreviousMonth(budgetYear, budgetMonth);

    const allCategories = categoryService.getAll();
    const categoryNames = new Map(allCategories.map((c) => [c.id, c.name]));

    // 카테고리별 지출 합산
    const monthStart = new Date(budgetYear, budgetMonth - 1, 1);
    const monthEnd = new Date(budgetYear, budgetMonth, 0, 23, 59, 59);
    const monthTransactions = transactionService.getByDateRange(monthStart, monthEnd);
    const expenseMap = new Map<string, number>();
    monthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        expenseMap.set(t.categoryId, (expenseMap.get(t.categoryId) ?? 0) + t.amount);
      });

    const catProgress = budgetService.getProgress(budgetYear, budgetMonth, expenseMap, categoryNames);
    setBudgetCategoryProgress(catProgress);

    const monthlyExp = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    setBudgetTotalProgress(budgetService.getTotalProgress(budgetYear, budgetMonth, monthlyExp));
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

  const getSubCategoryName = (subCategoryId?: string): string | undefined => {
    if (!subCategoryId) return undefined;
    const sub = subCategoryService.getById(subCategoryId);
    return sub?.name;
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
      subCategoryName={getSubCategoryName(item.subCategoryId)}
      paymentMethodName={getPaymentMethodName(item.paymentMethodId)}
      onDelete={() => handleDelete(item.id)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.textTertiary }]}>거래 내역이 없습니다</Text>
      <Text style={[styles.emptySubtext, { color: theme.colors.textTertiary }]}>
        아래 + 버튼을 눌러 거래를 추가해보세요
      </Text>
    </View>
  );

  // 월별 요약 계산
  const monthlyIncome = dailySummaries.reduce((sum, s) => sum + s.totalIncome, 0);
  const monthlyExpense = dailySummaries.reduce((sum, s) => sum + s.totalExpense, 0);
  const monthlyBalance = monthlyIncome - monthlyExpense;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <ViewToggle view={viewMode} onViewChange={setViewMode} />

      {viewMode === 'list' ? (
        // 리스트 뷰
        <>
          <SummaryCard
            balance={balance}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
          />

          <TouchableOpacity
            onPress={() => setBudgetCollapsed(!budgetCollapsed)}
            activeOpacity={0.7}
          >
            <BudgetProgressBar
              totalProgress={budgetTotalProgress}
              categoryProgress={budgetCategoryProgress}
              collapsed={budgetCollapsed}
            />
          </TouchableOpacity>

          <View style={styles.filterContainer}>
            {(['all', 'income', 'expense'] as FilterType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterButton,
                  { backgroundColor: theme.colors.border },
                  filter === type && { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => setFilter(type)}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: theme.colors.textSecondary },
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
          <View style={[styles.monthlySummary, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>수입</Text>
              <Text style={[styles.incomeText, { color: theme.colors.income }]}>+{monthlyIncome.toLocaleString()}원</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>지출</Text>
              <Text style={[styles.expenseText, { color: theme.colors.expense }]}>-{monthlyExpense.toLocaleString()}원</Text>
            </View>
            <View style={[styles.summaryRow, styles.balanceRow, { borderTopColor: theme.colors.borderLight }]}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>잔액</Text>
              <Text style={[
                styles.balanceText,
                { color: monthlyBalance >= 0 ? theme.colors.income : theme.colors.expense },
              ]}>
                {monthlyBalance >= 0 ? '+' : ''}{monthlyBalance.toLocaleString()}원
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setBudgetCollapsed(!budgetCollapsed)}
            activeOpacity={0.7}
          >
            <BudgetProgressBar
              totalProgress={budgetTotalProgress}
              categoryProgress={budgetCategoryProgress}
              collapsed={budgetCollapsed}
            />
          </TouchableOpacity>

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
  },
  filterText: {
    fontSize: 14,
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
  monthlySummary: {
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
    marginTop: 8,
    paddingTop: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  incomeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  expenseText: {
    fontSize: 16,
    fontWeight: '600',
  },
  balanceText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
