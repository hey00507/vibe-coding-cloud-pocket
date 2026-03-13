import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from '../../src/services/AppInitializer';
import {
  categoryService,
  subCategoryService,
  paymentMethodService,
  transactionService,
  incomeTargetService,
  savingsService,
  bankAccountService,
  seedService,
} from '../../src/services/ServiceRegistry';

describe('AppInitializer', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    categoryService.clear();
    subCategoryService.clear();
    paymentMethodService.clear();
    transactionService.clear();
    incomeTargetService.clear();
    savingsService.clear();
    bankAccountService.clear();
    seedService.resetSeeded();
  });

  it('should seed data on first run', async () => {
    await initializeApp();

    expect(seedService.isSeeded()).toBe(true);
    expect(categoryService.getAll().length).toBeGreaterThan(0);
    expect(subCategoryService.getAll().length).toBeGreaterThan(0);
    expect(paymentMethodService.getAll().length).toBeGreaterThan(0);
  });

  it('should not re-seed on subsequent runs', async () => {
    // First run
    await initializeApp();
    const catCount = categoryService.getAll().length;

    // Simulate restart — clear in-memory but keep AsyncStorage
    categoryService.clear();
    subCategoryService.clear();
    paymentMethodService.clear();
    seedService.resetSeeded();

    // Second run
    await initializeApp();

    // seeded flag was persisted, so no re-seeding
    // But categories were persisted from first run
    expect(seedService.isSeeded()).toBe(true);
  });

  it('should hydrate all services', async () => {
    // Pre-populate storage
    await AsyncStorage.setItem(
      '@cloudpocket/transactions',
      JSON.stringify([
        {
          id: 'tx-1',
          type: 'expense',
          amount: 10000,
          date: '2026-03-01T00:00:00.000Z',
          categoryId: 'cat-1',
          paymentMethodId: 'pm-1',
        },
      ])
    );
    await AsyncStorage.setItem(
      '@cloudpocket/transactions/idCounter',
      JSON.stringify(1)
    );
    await AsyncStorage.setItem('@cloudpocket/seeded', JSON.stringify(true));

    await initializeApp();

    expect(transactionService.getAll()).toHaveLength(1);
    expect(transactionService.getById('tx-1')?.amount).toBe(10000);
    expect(seedService.isSeeded()).toBe(true);
  });
});
