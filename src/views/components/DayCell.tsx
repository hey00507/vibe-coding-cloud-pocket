import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../controllers/useTheme';

interface DayCellProps {
  day: number | null;
  balance?: number;
  isToday?: boolean;
  hasTransactions?: boolean;
  selectable?: boolean;
  isSelected?: boolean;
  onPress?: () => void;
}

const DayCell: React.FC<DayCellProps> = ({
  day,
  balance,
  isToday = false,
  hasTransactions = false,
  selectable = false,
  isSelected = false,
  onPress,
}) => {
  const { theme } = useTheme();

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
      style={[
        styles.cell,
        isToday && { backgroundColor: theme.colors.primaryLight },
        isSelected && { backgroundColor: theme.colors.selectedDayBackground, borderRadius: 20 },
      ]}
      onPress={onPress}
      disabled={!selectable && !hasTransactions}
    >
      <Text style={[styles.dayText, { color: theme.colors.text }, isToday && { fontWeight: '700', color: theme.colors.primary }]}>
        {day}
      </Text>
      {hasTransactions && balance !== undefined && (
        <Text
          style={[
            styles.balanceText,
            { color: balance >= 0 ? theme.colors.income : theme.colors.expense },
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
  dayText: {
    fontSize: 14,
  },
  balanceText: {
    fontSize: 10,
    marginTop: 2,
  },
});

export default DayCell;
