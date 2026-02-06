import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PeriodType } from '../../types';

interface PeriodSelectorProps {
  periodType: PeriodType;
  year: number;
  month: number;
  onPeriodTypeChange: (type: PeriodType) => void;
  onPrev: () => void;
  onNext: () => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  periodType,
  year,
  month,
  onPeriodTypeChange,
  onPrev,
  onNext,
}) => {
  const label =
    periodType === 'monthly' ? `${year}년 ${month}월` : `${year}년`;

  return (
    <View>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            periodType === 'monthly' && styles.activeToggle,
          ]}
          onPress={() => onPeriodTypeChange('monthly')}
        >
          <Text
            style={[
              styles.toggleText,
              periodType === 'monthly' && styles.activeToggleText,
            ]}
          >
            월별
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            periodType === 'yearly' && styles.activeToggle,
          ]}
          onPress={() => onPeriodTypeChange('yearly')}
        >
          <Text
            style={[
              styles.toggleText,
              periodType === 'yearly' && styles.activeToggleText,
            ]}
          >
            연도별
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.navContainer}>
        <TouchableOpacity onPress={onPrev} style={styles.navButton}>
          <Text style={styles.navText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity onPress={onNext} style={styles.navButton}>
          <Text style={styles.navText}>▶</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: '#fff',
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
  },
  activeToggleText: {
    color: '#000',
    fontWeight: '600',
  },
  navContainer: {
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
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});

export default PeriodSelector;
