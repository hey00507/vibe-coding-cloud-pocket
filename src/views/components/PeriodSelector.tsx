import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PeriodType } from '../../types';
import { useTheme } from '../../controllers/useTheme';

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
  const { theme } = useTheme();

  const label =
    periodType === 'monthly' ? `${year}년 ${month}월` : `${year}년`;

  return (
    <View>
      <View style={[styles.toggleContainer, { backgroundColor: theme.colors.borderLight }]}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            periodType === 'monthly' && { backgroundColor: theme.colors.cardBackground },
          ]}
          onPress={() => onPeriodTypeChange('monthly')}
        >
          <Text
            style={[
              styles.toggleText,
              { color: theme.colors.textSecondary },
              periodType === 'monthly' && { color: theme.colors.text, fontWeight: '600' },
            ]}
          >
            월별
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            periodType === 'yearly' && { backgroundColor: theme.colors.cardBackground },
          ]}
          onPress={() => onPeriodTypeChange('yearly')}
        >
          <Text
            style={[
              styles.toggleText,
              { color: theme.colors.textSecondary },
              periodType === 'yearly' && { color: theme.colors.text, fontWeight: '600' },
            ]}
          >
            연도별
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.navContainer}>
        <TouchableOpacity onPress={onPrev} style={styles.navButton}>
          <Text style={[styles.navText, { color: theme.colors.textSecondary }]}>◀</Text>
        </TouchableOpacity>
        <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
        <TouchableOpacity onPress={onNext} style={styles.navButton}>
          <Text style={[styles.navText, { color: theme.colors.textSecondary }]}>▶</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: 'row',
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
  toggleText: {
    fontSize: 14,
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
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default PeriodSelector;
