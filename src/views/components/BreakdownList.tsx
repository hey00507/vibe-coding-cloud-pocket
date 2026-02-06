import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface BreakdownItem {
  id: string;
  name: string;
  icon?: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

interface BreakdownListProps {
  title: string;
  items: BreakdownItem[];
}

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('ko-KR') + '원';
};

const BreakdownList: React.FC<BreakdownListProps> = ({ title, items }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>데이터가 없습니다</Text>
      ) : (
        items.map((item) => (
          <View key={item.id} style={styles.itemContainer}>
            <View style={styles.itemHeader}>
              <View style={styles.nameRow}>
                {item.icon ? (
                  <Text style={styles.icon}>{item.icon}</Text>
                ) : null}
                <Text style={styles.name}>{item.name}</Text>
              </View>
              <Text style={styles.count}>{item.transactionCount}건</Text>
            </View>
            <View style={styles.itemDetail}>
              <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
              <View style={styles.barRow}>
                <View style={styles.barBackground}>
                  <View
                    style={[styles.barFill, { width: `${item.percentage}%` }]}
                  />
                </View>
                <Text style={styles.percentage}>{item.percentage}%</Text>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  itemContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: 6,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  count: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  itemDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  barBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginRight: 8,
  },
  barFill: {
    height: 8,
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    minWidth: 35,
    textAlign: 'right',
  },
});

export default BreakdownList;
