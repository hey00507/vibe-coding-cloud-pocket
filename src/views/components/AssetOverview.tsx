import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BankAccount, BankTier } from '../../types';

interface AssetOverviewProps {
  accounts: BankAccount[];
  totalAssets: number;
}

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('ko-KR') + '원';
};

const TIER_LABELS: Record<BankTier, string> = {
  primary: '1금융권',
  secondary: '2금융권',
  savings_bank: '저축은행',
};

const TIER_ORDER: BankTier[] = ['primary', 'secondary', 'savings_bank'];

export default function AssetOverview({ accounts, totalAssets }: AssetOverviewProps) {
  // 등급별 그룹화
  const groupedByTier = TIER_ORDER.map((tier) => ({
    tier,
    label: TIER_LABELS[tier],
    accounts: accounts.filter((a) => a.tier === tier),
    subtotal: accounts.filter((a) => a.tier === tier).reduce((sum, a) => sum + a.balance, 0),
  })).filter((group) => group.accounts.length > 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>자산 현황</Text>
        <Text style={styles.totalAmount}>{formatCurrency(totalAssets)}</Text>
      </View>

      {accounts.length === 0 ? (
        <Text style={styles.emptyText}>등록된 계좌가 없습니다</Text>
      ) : (
        groupedByTier.map((group) => (
          <View key={group.tier} style={styles.tierGroup}>
            <View style={styles.tierHeader}>
              <Text style={styles.tierLabel}>{group.label}</Text>
              <Text style={styles.tierSubtotal}>{formatCurrency(group.subtotal)}</Text>
            </View>
            {group.accounts.map((account) => (
              <View key={account.id} style={styles.accountRow}>
                <View style={styles.accountInfo}>
                  <Text style={styles.bankName}>{account.bank}</Text>
                  <Text style={styles.purpose}>{account.purpose}</Text>
                </View>
                <Text style={[styles.balance, !account.isActive && styles.inactiveBalance]}>
                  {formatCurrency(account.balance)}
                </Text>
              </View>
            ))}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1565C0',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  tierGroup: {
    marginBottom: 12,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  tierLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  tierSubtotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  accountInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  purpose: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  balance: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  inactiveBalance: {
    color: '#999',
  },
});
