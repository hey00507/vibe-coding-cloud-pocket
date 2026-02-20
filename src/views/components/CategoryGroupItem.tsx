import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Category, SubCategory } from '../../types';

interface CategoryGroupItemProps {
  category: Category;
  subCategories: SubCategory[];
  expanded: boolean;
  onToggle: () => void;
  onDeleteCategory: (id: string, name: string) => void;
  onDeleteSubCategory: (id: string, name: string) => void;
  onAddSubCategory: (categoryId: string) => void;
}

export default function CategoryGroupItem({
  category,
  subCategories,
  expanded,
  onToggle,
  onDeleteCategory,
  onDeleteSubCategory,
  onAddSubCategory,
}: CategoryGroupItemProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={onToggle}>
        <View style={styles.headerLeft}>
          <Text style={styles.expandIcon}>{expanded ? '▼' : '▶'}</Text>
          <Text style={styles.categoryIcon}>{category.icon || '📁'}</Text>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.count}>({subCategories.length})</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDeleteCategory(category.id, category.name)}
        >
          <Text style={styles.deleteText}>삭제</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.subList}>
          {subCategories.map((sub) => (
            <View key={sub.id} style={styles.subItem}>
              <View style={styles.subItemLeft}>
                <Text style={styles.subIcon}>{sub.icon || '📋'}</Text>
                <Text style={styles.subName}>{sub.name}</Text>
              </View>
              <TouchableOpacity
                style={styles.subDeleteButton}
                onPress={() => onDeleteSubCategory(sub.id, sub.name)}
              >
                <Text style={styles.subDeleteText}>삭제</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addSubButton}
            onPress={() => onAddSubCategory(category.id)}
          >
            <Text style={styles.addSubText}>+ 소분류 추가</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandIcon: {
    fontSize: 12,
    color: '#666',
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  count: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FFEBEE',
  },
  deleteText: {
    fontSize: 14,
    color: '#F44336',
  },
  subList: {
    paddingLeft: 44,
    paddingRight: 16,
    paddingBottom: 12,
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  subItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subIcon: {
    fontSize: 16,
  },
  subName: {
    fontSize: 14,
    color: '#555',
  },
  subDeleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  subDeleteText: {
    fontSize: 12,
    color: '#999',
  },
  addSubButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  addSubText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
});
