import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../controllers/useTheme';

interface CalendarHeaderProps {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  year,
  month,
  onPrevMonth,
  onNextMonth,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPrevMonth} style={styles.navButton}>
        <Text style={[styles.navText, { color: theme.colors.textSecondary }]}>◀</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {year}년 {month}월
      </Text>
      <TouchableOpacity onPress={onNextMonth} style={styles.navButton}>
        <Text style={[styles.navText, { color: theme.colors.textSecondary }]}>▶</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navButton: {
    padding: 8,
  },
  navText: {
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CalendarHeader;
