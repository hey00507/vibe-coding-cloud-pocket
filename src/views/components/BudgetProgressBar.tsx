import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../controllers/useTheme';
import { BudgetProgress, BudgetStatus } from '../../types';

interface TotalProgress {
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: BudgetStatus;
}

interface BudgetProgressBarProps {
  totalProgress: TotalProgress;
  categoryProgress: BudgetProgress[];
  collapsed?: boolean;
  maxCategories?: number;
}

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('ko-KR') + '원';
};

export default function BudgetProgressBar({
  totalProgress,
  categoryProgress,
  collapsed = false,
  maxCategories = 5,
}: BudgetProgressBarProps) {
  const { theme } = useTheme();

  const getBarColor = (status: BudgetStatus) => {
    switch (status) {
      case 'over':
        return theme.colors.expense;
      case 'warning':
        return theme.colors.warning;
      default:
        return theme.colors.income;
    }
  };

  const getBarBgColor = (status: BudgetStatus) => {
    switch (status) {
      case 'over':
        return theme.colors.expenseLight;
      case 'warning':
        return theme.colors.primaryLight;
      default:
        return theme.colors.incomeLight;
    }
  };

  // 예산 미설정 시 CTA
  if (totalProgress.budget === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}>
        <Text style={[styles.ctaText, { color: theme.colors.textSecondary }]}>
          예산을 설정해보세요
        </Text>
      </View>
    );
  }

  const visibleCategories = categoryProgress.slice(0, maxCategories);
  const barWidth = Math.min(totalProgress.percentage, 100);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}>
      {/* 전체 예산 */}
      <View style={styles.totalSection}>
        <View style={styles.totalHeader}>
          <Text style={[styles.totalLabel, { color: theme.colors.text }]}>전체 예산</Text>
          <Text style={[styles.totalPercentage, { color: getBarColor(totalProgress.status) }]}>
            {totalProgress.percentage}%
          </Text>
        </View>
        <View style={[styles.barBackground, { backgroundColor: getBarBgColor(totalProgress.status) }]}>
          <View
            style={[
              styles.barFill,
              {
                width: `${barWidth}%`,
                backgroundColor: getBarColor(totalProgress.status),
              },
            ]}
          />
        </View>
        <View style={styles.totalAmounts}>
          <Text style={[styles.spentAmount, { color: theme.colors.text }]}>
            {formatCurrency(totalProgress.spent)}
          </Text>
          <Text style={[styles.budgetAmount, { color: theme.colors.textTertiary }]}>
            / {formatCurrency(totalProgress.budget)}
          </Text>
        </View>
      </View>

      {/* 카테고리별 미니 바 */}
      {!collapsed && visibleCategories.map((cat) => {
        const catBarWidth = Math.min(cat.percentage, 100);
        return (
          <View key={cat.categoryId} style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <Text style={[styles.categoryName, { color: theme.colors.textSecondary }]}>
                {cat.categoryName}
              </Text>
              <Text style={[styles.categoryPercentage, { color: getBarColor(cat.status) }]}>
                {cat.percentage}%
              </Text>
            </View>
            <View style={[styles.miniBarBackground, { backgroundColor: getBarBgColor(cat.status) }]}>
              <View
                style={[
                  styles.miniBarFill,
                  {
                    width: `${catBarWidth}%`,
                    backgroundColor: getBarColor(cat.status),
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  ctaText: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 8,
  },
  totalSection: {
    marginBottom: 4,
  },
  totalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalPercentage: {
    fontSize: 14,
    fontWeight: '700',
  },
  barBackground: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  totalAmounts: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  spentAmount: {
    fontSize: 13,
    fontWeight: '600',
  },
  budgetAmount: {
    fontSize: 13,
    marginLeft: 4,
  },
  categoryItem: {
    marginTop: 10,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
  },
  categoryPercentage: {
    fontSize: 12,
    fontWeight: '600',
  },
  miniBarBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
