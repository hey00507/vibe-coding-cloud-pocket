import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Category, SubCategory } from '../../types';
import { useTheme } from '../../controllers/useTheme';

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
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}>
      <TouchableOpacity style={styles.header} onPress={onToggle}>
        <View style={styles.headerLeft}>
          <Text style={[styles.expandIcon, { color: theme.colors.textSecondary }]}>{expanded ? '▼' : '▶'}</Text>
          <Text style={styles.categoryIcon}>{category.icon || '📁'}</Text>
          <Text style={[styles.categoryName, { color: theme.colors.text }]}>{category.name}</Text>
          <Text style={[styles.count, { color: theme.colors.textTertiary }]}>({subCategories.length})</Text>
        </View>
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: theme.colors.expenseLight }]}
          onPress={() => onDeleteCategory(category.id, category.name)}
        >
          <Text style={[styles.deleteText, { color: theme.colors.expense }]}>삭제</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.subList}>
          {subCategories.map((sub) => (
            <View key={sub.id} style={[styles.subItem, { borderBottomColor: theme.colors.borderLight }]}>
              <View style={styles.subItemLeft}>
                <Text style={styles.subIcon}>{sub.icon || '📋'}</Text>
                <Text style={[styles.subName, { color: theme.colors.textSecondary }]}>{sub.name}</Text>
              </View>
              <TouchableOpacity
                style={styles.subDeleteButton}
                onPress={() => onDeleteSubCategory(sub.id, sub.name)}
              >
                <Text style={[styles.subDeleteText, { color: theme.colors.textTertiary }]}>삭제</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addSubButton}
            onPress={() => onAddSubCategory(category.id)}
          >
            <Text style={[styles.addSubText, { color: theme.colors.primary }]}>+ 소분류 추가</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  count: {
    fontSize: 12,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteText: {
    fontSize: 14,
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
  },
  subDeleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  subDeleteText: {
    fontSize: 12,
  },
  addSubButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  addSubText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
