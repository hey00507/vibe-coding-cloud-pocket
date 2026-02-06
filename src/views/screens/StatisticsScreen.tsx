import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StatisticsScreenProps } from '../../types/navigation';
import {
  PeriodType,
  PeriodSummary,
  CategoryBreakdown,
  PaymentMethodBreakdown,
} from '../../types';
import {
  transactionService,
  categoryService,
  paymentMethodService,
} from './HomeScreen';
import PeriodSelector from '../components/PeriodSelector';
import SummaryCard from '../components/SummaryCard';
import BreakdownList, { BreakdownItem } from '../components/BreakdownList';

export default function StatisticsScreen({}: StatisticsScreenProps) {
  const now = new Date();
  const [periodType, setPeriodType] = useState<PeriodType>('monthly');
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [summary, setSummary] = useState<PeriodSummary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0,
  });
  const [categoryItems, setCategoryItems] = useState<BreakdownItem[]>([]);
  const [paymentItems, setPaymentItems] = useState<BreakdownItem[]>([]);

  const loadData = useCallback(() => {
    // 기간별 요약
    const periodSummary =
      periodType === 'monthly'
        ? transactionService.getMonthlySummary(currentYear, currentMonth)
        : transactionService.getYearlySummary(currentYear);
    setSummary(periodSummary);

    // 기간 범위 계산
    let startDate: Date;
    let endDate: Date;
    if (periodType === 'monthly') {
      startDate = new Date(currentYear, currentMonth - 1, 1);
      endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
    } else {
      startDate = new Date(currentYear, 0, 1);
      endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
    }

    // 카테고리별 지출 집계
    const categoryBreakdown = transactionService.getCategoryBreakdown(
      startDate,
      endDate,
      'expense'
    );
    setCategoryItems(mapCategoryBreakdown(categoryBreakdown));

    // 결제수단별 지출 집계
    const paymentBreakdown = transactionService.getPaymentMethodBreakdown(
      startDate,
      endDate,
      'expense'
    );
    setPaymentItems(mapPaymentBreakdown(paymentBreakdown));
  }, [periodType, currentYear, currentMonth]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const mapCategoryBreakdown = (
    data: CategoryBreakdown[]
  ): BreakdownItem[] => {
    return data.map((item) => {
      const category = categoryService.getById(item.categoryId);
      return {
        id: item.categoryId,
        name: category?.name ?? '미분류',
        icon: category?.icon,
        amount: item.amount,
        percentage: item.percentage,
        transactionCount: item.transactionCount,
      };
    });
  };

  const mapPaymentBreakdown = (
    data: PaymentMethodBreakdown[]
  ): BreakdownItem[] => {
    return data.map((item) => {
      const method = paymentMethodService.getById(item.paymentMethodId);
      return {
        id: item.paymentMethodId,
        name: method?.name ?? '미지정',
        icon: method?.icon,
        amount: item.amount,
        percentage: item.percentage,
        transactionCount: item.transactionCount,
      };
    });
  };

  const handlePrev = () => {
    if (periodType === 'monthly') {
      if (currentMonth === 1) {
        setCurrentYear(currentYear - 1);
        setCurrentMonth(12);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      setCurrentYear(currentYear - 1);
    }
  };

  const handleNext = () => {
    if (periodType === 'monthly') {
      if (currentMonth === 12) {
        setCurrentYear(currentYear + 1);
        setCurrentMonth(1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else {
      setCurrentYear(currentYear + 1);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <PeriodSelector
        periodType={periodType}
        year={currentYear}
        month={currentMonth}
        onPeriodTypeChange={setPeriodType}
        onPrev={handlePrev}
        onNext={handleNext}
      />
      <SummaryCard
        balance={summary.balance}
        totalIncome={summary.totalIncome}
        totalExpense={summary.totalExpense}
      />
      <BreakdownList title="카테고리별 지출" items={categoryItems} />
      <BreakdownList title="결제수단별 지출" items={paymentItems} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});
