import React from 'react';
import { render, screen } from '@testing-library/react-native';
import AssetOverview from '../../src/views/components/AssetOverview';
import { BankAccount } from '../../src/types';

describe('AssetOverview', () => {
  const createMockAccount = (
    overrides: Partial<BankAccount> = {}
  ): BankAccount => ({
    id: 'account-1',
    bank: '국민은행',
    purpose: '급여통장',
    balance: 5000000,
    tier: 'primary',
    isActive: true,
    ...overrides,
  });

  describe('rendering', () => {
    it('should render the title', () => {
      render(<AssetOverview accounts={[]} totalAssets={0} />);

      expect(screen.getByText('자산 현황')).toBeTruthy();
    });

    it('should render total assets amount', () => {
      render(
        <AssetOverview
          accounts={[
            createMockAccount({ id: 'a1', tier: 'primary', balance: 3000000 }),
            createMockAccount({ id: 'a2', tier: 'secondary', balance: 2000000 }),
          ]}
          totalAssets={5000000}
        />
      );

      expect(screen.getByText('5,000,000원')).toBeTruthy();
    });

    it('should render empty state when no accounts', () => {
      render(<AssetOverview accounts={[]} totalAssets={0} />);

      expect(screen.getByText('등록된 계좌가 없습니다')).toBeTruthy();
    });
  });

  describe('tier groups', () => {
    it('should render primary tier label', () => {
      const accounts = [
        createMockAccount({ id: 'a1', tier: 'primary', bank: '국민은행' }),
      ];

      render(<AssetOverview accounts={accounts} totalAssets={5000000} />);

      expect(screen.getByText('1금융권')).toBeTruthy();
    });

    it('should render secondary tier label', () => {
      const accounts = [
        createMockAccount({ id: 'a1', tier: 'secondary', bank: '카카오뱅크' }),
      ];

      render(<AssetOverview accounts={accounts} totalAssets={3000000} />);

      expect(screen.getByText('2금융권')).toBeTruthy();
    });

    it('should render savings_bank tier label', () => {
      const accounts = [
        createMockAccount({ id: 'a1', tier: 'savings_bank', bank: 'SBI저축은행' }),
      ];

      render(<AssetOverview accounts={accounts} totalAssets={2000000} />);

      expect(screen.getByText('저축은행')).toBeTruthy();
    });

    it('should render multiple tier groups', () => {
      const accounts = [
        createMockAccount({ id: 'a1', tier: 'primary', bank: '국민은행', balance: 5000000 }),
        createMockAccount({ id: 'a2', tier: 'secondary', bank: '카카오뱅크', balance: 3000000 }),
        createMockAccount({ id: 'a3', tier: 'savings_bank', bank: 'SBI저축은행', balance: 2000000 }),
      ];

      render(<AssetOverview accounts={accounts} totalAssets={10000000} />);

      expect(screen.getByText('1금융권')).toBeTruthy();
      expect(screen.getByText('2금융권')).toBeTruthy();
      expect(screen.getByText('저축은행')).toBeTruthy();
    });

    it('should not render tier group with no accounts', () => {
      const accounts = [
        createMockAccount({ id: 'a1', tier: 'primary', bank: '국민은행' }),
      ];

      render(<AssetOverview accounts={accounts} totalAssets={5000000} />);

      expect(screen.getByText('1금융권')).toBeTruthy();
      expect(screen.queryByText('2금융권')).toBeNull();
      expect(screen.queryByText('저축은행')).toBeNull();
    });
  });

  describe('account details', () => {
    it('should render bank names', () => {
      const accounts = [
        createMockAccount({ id: 'a1', bank: '국민은행', tier: 'primary' }),
        createMockAccount({ id: 'a2', bank: '신한은행', tier: 'primary' }),
      ];

      render(<AssetOverview accounts={accounts} totalAssets={10000000} />);

      expect(screen.getByText('국민은행')).toBeTruthy();
      expect(screen.getByText('신한은행')).toBeTruthy();
    });

    it('should render purposes', () => {
      const accounts = [
        createMockAccount({ id: 'a1', purpose: '급여통장' }),
        createMockAccount({ id: 'a2', purpose: '생활비통장' }),
      ];

      render(<AssetOverview accounts={accounts} totalAssets={10000000} />);

      expect(screen.getByText('급여통장')).toBeTruthy();
      expect(screen.getByText('생활비통장')).toBeTruthy();
    });

    it('should render inactive account with inactive style', () => {
      const accounts = [
        createMockAccount({ id: 'a1', isActive: false, balance: 1500000 }),
      ];

      render(<AssetOverview accounts={accounts} totalAssets={1500000} />);

      expect(screen.getAllByText('1,500,000원').length).toBeGreaterThanOrEqual(1);
    });

    it('should render formatted balances', () => {
      const accounts = [
        createMockAccount({ id: 'a1', balance: 5000000 }),
        createMockAccount({ id: 'a2', balance: 3000000 }),
      ];

      render(<AssetOverview accounts={accounts} totalAssets={8000000} />);

      expect(screen.getByText('5,000,000원')).toBeTruthy();
      expect(screen.getByText('3,000,000원')).toBeTruthy();
    });
  });
});
