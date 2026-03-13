import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../controllers/useTheme';

export type ViewMode = 'list' | 'calendar';

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.borderLight }]}>
      <TouchableOpacity
        style={[styles.button, view === 'list' && { backgroundColor: theme.colors.cardBackground }]}
        onPress={() => onViewChange('list')}
      >
        <Text style={[styles.text, { color: theme.colors.textSecondary }, view === 'list' && { color: theme.colors.text, fontWeight: '600' }]}>
          리스트
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, view === 'calendar' && { backgroundColor: theme.colors.cardBackground }]}
        onPress={() => onViewChange('calendar')}
      >
        <Text style={[styles.text, { color: theme.colors.textSecondary }, view === 'calendar' && { color: theme.colors.text, fontWeight: '600' }]}>
          캘린더
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  text: {
    fontSize: 14,
  },
});

export default ViewToggle;
