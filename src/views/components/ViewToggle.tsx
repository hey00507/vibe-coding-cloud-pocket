import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type ViewMode = 'list' | 'calendar';

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, view === 'list' && styles.activeButton]}
        onPress={() => onViewChange('list')}
      >
        <Text style={[styles.text, view === 'list' && styles.activeText]}>
          리스트
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, view === 'calendar' && styles.activeButton]}
        onPress={() => onViewChange('calendar')}
      >
        <Text style={[styles.text, view === 'calendar' && styles.activeText]}>
          캘린더
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
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
  activeButton: {
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 14,
    color: '#666',
  },
  activeText: {
    color: '#000',
    fontWeight: '600',
  },
});

export default ViewToggle;
