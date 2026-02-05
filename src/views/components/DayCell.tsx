import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface DayCellProps {
  day: number | null;
  balance?: number;
  isToday?: boolean;
  hasTransactions?: boolean;
  onPress?: () => void;
}

const DayCell: React.FC<DayCellProps> = ({
  day,
  balance,
  isToday = false,
  hasTransactions = false,
  onPress,
}) => {
  if (day === null) {
    return <View style={styles.emptyCell} />;
  }

  const formatBalance = (amount: number): string => {
    const absAmount = Math.abs(amount);
    const prefix = amount >= 0 ? '+' : '-';

    if (absAmount >= 1000000) {
      return `${prefix}${(absAmount / 1000000).toFixed(1)}M`;
    }
    if (absAmount >= 1000) {
      return `${prefix}${(absAmount / 1000).toFixed(0)}k`;
    }
    return `${prefix}${absAmount}`;
  };

  return (
    <TouchableOpacity
      style={[styles.cell, isToday && styles.todayCell]}
      onPress={onPress}
      disabled={!hasTransactions}
    >
      <Text style={[styles.dayText, isToday && styles.todayText]}>{day}</Text>
      {hasTransactions && balance !== undefined && (
        <Text
          style={[
            styles.balanceText,
            balance >= 0 ? styles.incomeText : styles.expenseText,
          ]}
        >
          {formatBalance(balance)}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
    margin: 1,
    borderRadius: 4,
  },
  emptyCell: {
    flex: 1,
    aspectRatio: 1,
    margin: 1,
  },
  todayCell: {
    backgroundColor: '#E3F2FD',
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  todayText: {
    fontWeight: '700',
    color: '#2196F3',
  },
  balanceText: {
    fontSize: 10,
    marginTop: 2,
  },
  incomeText: {
    color: '#4CAF50',
  },
  expenseText: {
    color: '#F44336',
  },
});

export default DayCell;
