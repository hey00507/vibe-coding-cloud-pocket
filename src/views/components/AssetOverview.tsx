import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BankAccount, BankTier } from '../../types';
import { useTheme } from '../../controllers/useTheme';

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
  const { theme } = useTheme();

  // 등급별 그룹화
  const groupedByTier = TIER_ORDER.map((tier) => ({
    tier,
    label: TIER_LABELS[tier],
    accounts: accounts.filter((a) => a.tier === tier),
    subtotal: accounts.filter((a) => a.tier === tier).reduce((sum, a) => sum + a.balance, 0),
  })).filter((group) => group.accounts.length > 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>자산 현황</Text>
        <Text style={[styles.totalAmount, { color: theme.colors.primaryDark }]}>{formatCurrency(totalAssets)}</Text>
      </View>

      {accounts.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.colors.textTertiary }]}>등록된 계좌가 없습니다</Text>
      ) : (
        groupedByTier.map((group) => (
          <View key={group.tier} style={styles.tierGroup}>
            <View style={[styles.tierHeader, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.tierLabel, { color: theme.colors.textSecondary }]}>{group.label}</Text>
              <Text style={[styles.tierSubtotal, { color: theme.colors.text }]}>{formatCurrency(group.subtotal)}</Text>
            </View>
            {group.accounts.map((account) => (
              <View key={account.id} style={[styles.accountRow, { borderBottomColor: theme.colors.borderLight }]}>
                <View style={styles.accountInfo}>
                  <Text style={[styles.bankName, { color: theme.colors.text }]}>{account.bank}</Text>
                  <Text style={[styles.purpose, { color: theme.colors.textTertiary }]}>{account.purpose}</Text>
                </View>
                <Text style={[styles.balance, { color: theme.colors.text }, !account.isActive && { color: theme.colors.textTertiary }]}>
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
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  tierLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  tierSubtotal: {
    fontSize: 14,
    fontWeight: '600',
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  accountInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 14,
    fontWeight: '500',
  },
  purpose: {
    fontSize: 12,
    marginTop: 2,
  },
  balance: {
    fontSize: 15,
    fontWeight: '600',
  },
});
