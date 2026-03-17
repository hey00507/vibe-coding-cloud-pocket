import AsyncStorage from '@react-native-async-storage/async-storage';
import { BudgetService } from '../../src/services/BudgetService';
import { StorageService } from '../../src/services/StorageService';
import { STORAGE_KEYS } from '../../src/constants/storageKeys';

describe('BudgetService persistence', () => {
  let service: BudgetService;
  let storageService: StorageService;

  beforeEach(async () => {
    await AsyncStorage.clear();
    service = new BudgetService();
    storageService = new StorageService();
  });

  it('should hydrate data from AsyncStorage', async () => {
    const stored = [
      { id: 'budget-1', categoryId: 'cat-1', monthlyAmount: 300000, year: 2026, month: 3 },
      { id: 'budget-2', categoryId: 'cat-2', monthlyAmount: 200000, year: 2026, month: 3 },
    ];
    await AsyncStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(stored));
    await AsyncStorage.setItem(STORAGE_KEYS.BUDGETS_ID_COUNTER, JSON.stringify(5));

    await service.hydrate(storageService, STORAGE_KEYS.BUDGETS, STORAGE_KEYS.BUDGETS_ID_COUNTER);

    expect(service.getAll()).toHaveLength(2);
    expect(service.getById('budget-1')?.monthlyAmount).toBe(300000);
    expect(service.getById('budget-2')?.categoryId).toBe('cat-2');
  });

  it('should restore idCounter and avoid ID collision', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.BUDGETS_ID_COUNTER, JSON.stringify(10));

    await service.hydrate(storageService, STORAGE_KEYS.BUDGETS, STORAGE_KEYS.BUDGETS_ID_COUNTER);
    const created = service.create({ categoryId: 'cat-1', monthlyAmount: 100000, year: 2026, month: 3 });

    expect(created.id).toContain('budget-11-');
  });

  it('should persist data after create', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.BUDGETS, STORAGE_KEYS.BUDGETS_ID_COUNTER);

    service.create({ categoryId: 'cat-1', monthlyAmount: 300000, year: 2026, month: 3 });

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.BUDGETS);
    const items = JSON.parse(stored!);
    expect(items).toHaveLength(1);
    expect(items[0].monthlyAmount).toBe(300000);
  });

  it('should persist data after update', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.BUDGETS, STORAGE_KEYS.BUDGETS_ID_COUNTER);
    const created = service.create({ categoryId: 'cat-1', monthlyAmount: 300000, year: 2026, month: 3 });

    service.update(created.id, { monthlyAmount: 500000 });

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.BUDGETS);
    const items = JSON.parse(stored!);
    expect(items[0].monthlyAmount).toBe(500000);
  });

  it('should persist data after delete', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.BUDGETS, STORAGE_KEYS.BUDGETS_ID_COUNTER);
    const created = service.create({ categoryId: 'cat-1', monthlyAmount: 300000, year: 2026, month: 3 });

    service.delete(created.id);

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.BUDGETS);
    const items = JSON.parse(stored!);
    expect(items).toHaveLength(0);
  });

  it('should not persist when delete returns false', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.BUDGETS, STORAGE_KEYS.BUDGETS_ID_COUNTER);
    const saveSpy = jest.spyOn(storageService, 'save');

    service.delete('nonexistent');

    expect(saveSpy).not.toHaveBeenCalled();
    saveSpy.mockRestore();
  });

  it('should persist after clear', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.BUDGETS, STORAGE_KEYS.BUDGETS_ID_COUNTER);
    service.create({ categoryId: 'cat-1', monthlyAmount: 300000, year: 2026, month: 3 });

    service.clear();

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.BUDGETS);
    const items = JSON.parse(stored!);
    expect(items).toHaveLength(0);
  });

  it('should persist after copyFromPreviousMonth', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.BUDGETS, STORAGE_KEYS.BUDGETS_ID_COUNTER);
    service.create({ categoryId: 'cat-1', monthlyAmount: 300000, year: 2026, month: 2 });

    service.copyFromPreviousMonth(2026, 3);

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.BUDGETS);
    const items = JSON.parse(stored!);
    // 2월 원본 + 3월 복사본
    expect(items).toHaveLength(2);
    expect(items.find((b: any) => b.month === 3)?.monthlyAmount).toBe(300000);
  });
});
