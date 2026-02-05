import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DatePickerModal from './DatePickerModal';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const [pickerVisible, setPickerVisible] = useState(false);

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date): boolean =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const isToday = isSameDay(selectedDate, today);
  const isYesterday = isSameDay(selectedDate, yesterday);

  const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const w = WEEKDAYS[date.getDay()];
    return `${y}년 ${m}월 ${d}일 (${w})`;
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const handleYesterday = () => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    onDateChange(y);
  };

  const handleDateSelect = (date: Date) => {
    setPickerVisible(false);
    onDateChange(date);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>날짜</Text>

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.button, isToday && styles.buttonActive]}
          onPress={handleToday}
        >
          <Text style={[styles.buttonText, isToday && styles.buttonTextActive]}>
            오늘
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isYesterday && styles.buttonActive]}
          onPress={handleYesterday}
        >
          <Text style={[styles.buttonText, isYesterday && styles.buttonTextActive]}>
            어제
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, !isToday && !isYesterday && styles.buttonActive]}
          onPress={() => setPickerVisible(true)}
        >
          <Text
            style={[
              styles.buttonText,
              !isToday && !isYesterday && styles.buttonTextActive,
            ]}
          >
            직접 선택
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.dateDisplay}>{formatDate(selectedDate)}</Text>

      <DatePickerModal
        visible={pickerVisible}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        onClose={() => setPickerVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  buttonText: {
    fontSize: 14,
    color: '#333',
  },
  buttonTextActive: {
    color: '#FFF',
  },
  dateDisplay: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default DateSelector;
