import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';

interface DatePickerModalProps {
  visible: boolean;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  selectedDate,
  onDateSelect,
  onClose,
}) => {
  const [displayYear, setDisplayYear] = useState(selectedDate.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(selectedDate.getMonth() + 1);

  useEffect(() => {
    setDisplayYear(selectedDate.getFullYear());
    setDisplayMonth(selectedDate.getMonth() + 1);
  }, [selectedDate]);

  const handlePrevMonth = () => {
    if (displayMonth === 1) {
      setDisplayYear(displayYear - 1);
      setDisplayMonth(12);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (displayMonth === 12) {
      setDisplayYear(displayYear + 1);
      setDisplayMonth(1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  const handleDayPress = (date: Date) => {
    onDateSelect(date);
  };

  const selectedDay =
    selectedDate.getFullYear() === displayYear &&
    selectedDate.getMonth() + 1 === displayMonth
      ? selectedDate.getDate()
      : undefined;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <CalendarHeader
            year={displayYear}
            month={displayMonth}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />

          <CalendarGrid
            year={displayYear}
            month={displayMonth}
            dailySummaries={[]}
            onDayPress={handleDayPress}
            selectable={true}
            selectedDay={selectedDay}
          />

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    width: '90%',
    maxWidth: 400,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
});

export default DatePickerModal;
