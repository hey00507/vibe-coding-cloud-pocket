import AsyncStorage from '@react-native-async-storage/async-storage';
import { TransactionService } from '../../src/services/TransactionService';
import { StorageService } from '../../src/services/StorageService';
import { STORAGE_KEYS } from '../../src/constants/storageKeys';

describe('TransactionService persistence', () => {
  let service: TransactionService;
  let storageService: StorageService;

  beforeEach(async () => {
    await AsyncStorage.clear();
    service = new TransactionService();
    storageService = new StorageService();
  });

  it('should hydrate data from AsyncStorage with Date revival', async () => {
    const dateStr = '2026-03-05T09:00:00.000Z';
    const stored = [
      {
        id: 'tx-1',
        type: 'expense',
        amount: 15000,
        date: dateStr,
        categoryId: 'cat-1',
        paymentMethodId: 'pm-1',
      },
    ];
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(stored));
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS_ID_COUNTER, JSON.stringify(5));

    await service.hydrate(storageService, STORAGE_KEYS.TRANSACTIONS, STORAGE_KEYS.TRANSACTIONS_ID_COUNTER);

    expect(service.getAll()).toHaveLength(1);
    const tx = service.getById('tx-1');
    expect(tx?.date).toBeInstanceOf(Date);
    expect(tx?.date.toISOString()).toBe(dateStr);
    expect(tx?.amount).toBe(15000);
  });

  it('should restore idCounter and avoid ID collision', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS_ID_COUNTER, JSON.stringify(10));

    await service.hydrate(storageService, STORAGE_KEYS.TRANSACTIONS, STORAGE_KEYS.TRANSACTIONS_ID_COUNTER);
    const created = service.create({
      type: 'expense',
      amount: 5000,
      date: new Date(),
      categoryId: 'cat-1',
      paymentMethodId: 'pm-1',
    });

    expect(created.id).toContain('transaction-11-');
  });

  it('should persist data after create', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.TRANSACTIONS, STORAGE_KEYS.TRANSACTIONS_ID_COUNTER);

    service.create({
      type: 'expense',
      amount: 10000,
      date: new Date('2026-03-01'),
      categoryId: 'cat-1',
      paymentMethodId: 'pm-1',
    });

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const items = JSON.parse(stored!);
    expect(items).toHaveLength(1);
    expect(items[0].amount).toBe(10000);
  });

  it('should persist data after update', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.TRANSACTIONS, STORAGE_KEYS.TRANSACTIONS_ID_COUNTER);
    const created = service.create({
      type: 'expense',
      amount: 10000,
      date: new Date('2026-03-01'),
      categoryId: 'cat-1',
      paymentMethodId: 'pm-1',
    });

    service.update(created.id, { amount: 20000 });

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const items = JSON.parse(stored!);
    expect(items[0].amount).toBe(20000);
  });

  it('should persist data after delete', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.TRANSACTIONS, STORAGE_KEYS.TRANSACTIONS_ID_COUNTER);
    const created = service.create({
      type: 'expense',
      amount: 10000,
      date: new Date('2026-03-01'),
      categoryId: 'cat-1',
      paymentMethodId: 'pm-1',
    });

    service.delete(created.id);

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const items = JSON.parse(stored!);
    expect(items).toHaveLength(0);
  });

  it('should not persist when delete returns false', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.TRANSACTIONS, STORAGE_KEYS.TRANSACTIONS_ID_COUNTER);
    const saveSpy = jest.spyOn(storageService, 'save');

    service.delete('nonexistent');

    expect(saveSpy).not.toHaveBeenCalled();
    saveSpy.mockRestore();
  });

  it('should persist data after clear', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.TRANSACTIONS, STORAGE_KEYS.TRANSACTIONS_ID_COUNTER);
    service.create({
      type: 'expense',
      amount: 10000,
      date: new Date('2026-03-01'),
      categoryId: 'cat-1',
      paymentMethodId: 'pm-1',
    });

    service.clear();

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const items = JSON.parse(stored!);
    expect(items).toHaveLength(0);
  });

  it('should round-trip Date fields correctly', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.TRANSACTIONS, STORAGE_KEYS.TRANSACTIONS_ID_COUNTER);
    const date = new Date('2026-06-15T12:00:00.000Z');
    service.create({
      type: 'income',
      amount: 3000000,
      date,
      categoryId: 'cat-2',
      paymentMethodId: 'pm-1',
    });

    const service2 = new TransactionService();
    await service2.hydrate(storageService, STORAGE_KEYS.TRANSACTIONS, STORAGE_KEYS.TRANSACTIONS_ID_COUNTER);

    const tx = service2.getAll()[0];
    expect(tx.date).toBeInstanceOf(Date);
    expect(tx.date.toISOString()).toBe(date.toISOString());
    expect(tx.amount).toBe(3000000);
  });
});
