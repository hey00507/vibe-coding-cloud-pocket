import AsyncStorage from '@react-native-async-storage/async-storage';
import { IncomeTargetService } from '../../src/services/IncomeTargetService';
import { StorageService } from '../../src/services/StorageService';
import { STORAGE_KEYS } from '../../src/constants/storageKeys';

describe('IncomeTargetService persistence', () => {
  let service: IncomeTargetService;
  let storageService: StorageService;

  beforeEach(async () => {
    await AsyncStorage.clear();
    service = new IncomeTargetService();
    storageService = new StorageService();
  });

  it('should hydrate data from AsyncStorage', async () => {
    const stored = [
      { id: 'it-1', categoryId: 'cat-1', year: 2026, month: 3, targetAmount: 5000000 },
    ];
    await AsyncStorage.setItem(STORAGE_KEYS.INCOME_TARGETS, JSON.stringify(stored));
    await AsyncStorage.setItem(STORAGE_KEYS.INCOME_TARGETS_ID_COUNTER, JSON.stringify(3));

    await service.hydrate(storageService, STORAGE_KEYS.INCOME_TARGETS, STORAGE_KEYS.INCOME_TARGETS_ID_COUNTER);

    expect(service.getAll()).toHaveLength(1);
    expect(service.getById('it-1')?.targetAmount).toBe(5000000);
  });

  it('should restore idCounter and avoid ID collision', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.INCOME_TARGETS_ID_COUNTER, JSON.stringify(7));

    await service.hydrate(storageService, STORAGE_KEYS.INCOME_TARGETS, STORAGE_KEYS.INCOME_TARGETS_ID_COUNTER);
    const created = service.create({ categoryId: 'cat-1', year: 2026, month: 4, targetAmount: 1000000 });

    expect(created.id).toContain('income-target-8-');
  });

  it('should persist data after create', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.INCOME_TARGETS, STORAGE_KEYS.INCOME_TARGETS_ID_COUNTER);

    service.create({ categoryId: 'cat-1', year: 2026, month: 3, targetAmount: 5000000 });

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.INCOME_TARGETS);
    const items = JSON.parse(stored!);
    expect(items).toHaveLength(1);
  });

  it('should persist data after update', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.INCOME_TARGETS, STORAGE_KEYS.INCOME_TARGETS_ID_COUNTER);
    const created = service.create({ categoryId: 'cat-1', year: 2026, month: 3, targetAmount: 5000000 });

    service.update(created.id, { targetAmount: 6000000 });

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.INCOME_TARGETS);
    const items = JSON.parse(stored!);
    expect(items[0].targetAmount).toBe(6000000);
  });

  it('should persist data after delete', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.INCOME_TARGETS, STORAGE_KEYS.INCOME_TARGETS_ID_COUNTER);
    const created = service.create({ categoryId: 'cat-1', year: 2026, month: 3, targetAmount: 5000000 });

    service.delete(created.id);

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.INCOME_TARGETS);
    const items = JSON.parse(stored!);
    expect(items).toHaveLength(0);
  });

  it('should not persist when delete returns false', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.INCOME_TARGETS, STORAGE_KEYS.INCOME_TARGETS_ID_COUNTER);
    const saveSpy = jest.spyOn(storageService, 'save');

    service.delete('nonexistent');

    expect(saveSpy).not.toHaveBeenCalled();
    saveSpy.mockRestore();
  });

  it('should persist data after clear', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.INCOME_TARGETS, STORAGE_KEYS.INCOME_TARGETS_ID_COUNTER);
    service.create({ categoryId: 'cat-1', year: 2026, month: 3, targetAmount: 5000000 });

    service.clear();

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.INCOME_TARGETS);
    const items = JSON.parse(stored!);
    expect(items).toHaveLength(0);
  });

  it('should round-trip data correctly', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.INCOME_TARGETS, STORAGE_KEYS.INCOME_TARGETS_ID_COUNTER);
    service.create({ categoryId: 'cat-1', year: 2026, month: 3, targetAmount: 5000000 });

    const service2 = new IncomeTargetService();
    await service2.hydrate(storageService, STORAGE_KEYS.INCOME_TARGETS, STORAGE_KEYS.INCOME_TARGETS_ID_COUNTER);

    expect(service2.getAll()).toHaveLength(1);
    expect(service2.getByMonth(2026, 3)).toHaveLength(1);
  });
});
