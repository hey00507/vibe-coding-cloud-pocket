import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DayCell from './DayCell';
import { DailySummary } from '../../types';
import { useTheme } from '../../controllers/useTheme';

interface CalendarGridProps {
  year: number;
  month: number;
  dailySummaries: DailySummary[];
  onDayPress: (date: Date) => void;
  selectable?: boolean;
  selectedDay?: number;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const CalendarGrid: React.FC<CalendarGridProps> = ({
  year,
  month,
  dailySummaries,
  onDayPress,
  selectable = false,
  selectedDay,
}) => {
  const { theme } = useTheme();

  const getDaysInMonth = (y: number, m: number): number => {
    return new Date(y, m, 0).getDate();
  };

  const getFirstDayOfMonth = (y: number, m: number): number => {
    return new Date(y, m - 1, 1).getDay();
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() + 1 === month &&
      today.getDate() === day
    );
  };

  const getSummaryForDay = (day: number): DailySummary | undefined => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dailySummaries.find((s) => s.date === dateStr);
  };

  const handleDayPress = (day: number) => {
    const date = new Date(year, month - 1, day);
    onDayPress(date);
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.weekdayRow, { borderBottomColor: theme.colors.borderLight }]}>
        {WEEKDAYS.map((day, index) => (
          <View key={index} style={styles.weekdayCell}>
            <Text
              style={[
                styles.weekdayText,
                { color: theme.colors.textSecondary },
                index === 0 && { color: theme.colors.expense },
                index === 6 && { color: theme.colors.primary },
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekRow}>
          {week.map((day, dayIndex) => {
            const summary = day ? getSummaryForDay(day) : undefined;
            return (
              <DayCell
                key={dayIndex}
                day={day}
                balance={summary?.balance}
                isToday={day ? isToday(day) : false}
                hasTransactions={!!summary}
                selectable={selectable}
                isSelected={day === selectedDay}
                onPress={day ? () => handleDayPress(day) : undefined}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
  },
  weekdayRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 4,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '500',
  },
  weekRow: {
    flexDirection: 'row',
  },
});

export default CalendarGrid;
