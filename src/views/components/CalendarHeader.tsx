import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPrevMonth} style={styles.navButton}>
        <Text style={styles.navText}>◀</Text>
      </TouchableOpacity>
      <Text style={styles.title}>
        {year}년 {month}월
      </Text>
      <TouchableOpacity onPress={onNextMonth} style={styles.navButton}>
        <Text style={styles.navText}>▶</Text>
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
    color: '#666',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});

export default CalendarHeader;
