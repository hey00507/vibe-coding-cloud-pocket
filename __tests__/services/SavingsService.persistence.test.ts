import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavingsService } from '../../src/services/SavingsService';
import { StorageService } from '../../src/services/StorageService';
import { STORAGE_KEYS } from '../../src/constants/storageKeys';

describe('SavingsService persistence', () => {
  let service: SavingsService;
  let storageService: StorageService;

  beforeEach(async () => {
    await AsyncStorage.clear();
    service = new SavingsService();
    storageService = new StorageService();
  });

  it('should hydrate data from AsyncStorage with Date revival', async () => {
    const stored = [
      {
        id: 'sav-1',
        name: '적금',
        status: 'active',
        interestRate: 3.5,
        bank: '신한',
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2027-01-01T00:00:00.000Z',
        monthlyAmount: 500000,
        paidMonths: 3,
        currentAmount: 1500000,
      },
    ];
    await AsyncStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(stored));
    await AsyncStorage.setItem(STORAGE_KEYS.SAVINGS_ID_COUNTER, JSON.stringify(2));

    await service.hydrate(storageService, STORAGE_KEYS.SAVINGS, STORAGE_KEYS.SAVINGS_ID_COUNTER);

    expect(service.getAll()).toHaveLength(1);
    const product = service.getById('sav-1');
    expect(product?.startDate).toBeInstanceOf(Date);
    expect(product?.endDate).toBeInstanceOf(Date);
    expect(product?.name).toBe('적금');
  });

  it('should restore idCounter and avoid ID collision', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.SAVINGS_ID_COUNTER, JSON.stringify(5));

    await service.hydrate(storageService, STORAGE_KEYS.SAVINGS, STORAGE_KEYS.SAVINGS_ID_COUNTER);
    const created = service.create({
      name: '정기예금',
      status: 'active',
      interestRate: 4.0,
      bank: '국민',
      startDate: new Date('2026-01-01'),
      monthlyAmount: 300000,
      paidMonths: 0,
      currentAmount: 0,
    });

    expect(created.id).toContain('savings-6-');
  });

  it('should persist data after create', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.SAVINGS, STORAGE_KEYS.SAVINGS_ID_COUNTER);

    service.create({
      name: '적금',
      status: 'active',
      interestRate: 3.5,
      bank: '신한',
      startDate: new Date('2026-01-01'),
      monthlyAmount: 500000,
      paidMonths: 0,
      currentAmount: 0,
    });

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.SAVINGS);
    const items = JSON.parse(stored!);
    expect(items).toHaveLength(1);
  });

  it('should persist data after update', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.SAVINGS, STORAGE_KEYS.SAVINGS_ID_COUNTER);
    const created = service.create({
      name: '적금',
      status: 'active',
      interestRate: 3.5,
      bank: '신한',
      startDate: new Date('2026-01-01'),
      monthlyAmount: 500000,
      paidMonths: 0,
      currentAmount: 0,
    });

    service.update(created.id, { currentAmount: 500000, paidMonths: 1 });

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.SAVINGS);
    const items = JSON.parse(stored!);
    expect(items[0].currentAmount).toBe(500000);
    expect(items[0].paidMonths).toBe(1);
  });

  it('should persist data after delete', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.SAVINGS, STORAGE_KEYS.SAVINGS_ID_COUNTER);
    const created = service.create({
      name: '적금',
      status: 'active',
      interestRate: 3.5,
      bank: '신한',
      startDate: new Date('2026-01-01'),
      monthlyAmount: 500000,
      paidMonths: 0,
      currentAmount: 0,
    });

    service.delete(created.id);

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.SAVINGS);
    const items = JSON.parse(stored!);
    expect(items).toHaveLength(0);
  });

  it('should not persist when delete returns false', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.SAVINGS, STORAGE_KEYS.SAVINGS_ID_COUNTER);
    const saveSpy = jest.spyOn(storageService, 'save');

    service.delete('nonexistent');

    expect(saveSpy).not.toHaveBeenCalled();
    saveSpy.mockRestore();
  });

  it('should persist data after clear', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.SAVINGS, STORAGE_KEYS.SAVINGS_ID_COUNTER);
    service.create({
      name: '적금',
      status: 'active',
      interestRate: 3.5,
      bank: '신한',
      startDate: new Date('2026-01-01'),
      monthlyAmount: 500000,
      paidMonths: 0,
      currentAmount: 0,
    });

    service.clear();

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.SAVINGS);
    const items = JSON.parse(stored!);
    expect(items).toHaveLength(0);
  });

  it('should round-trip Date fields correctly', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.SAVINGS, STORAGE_KEYS.SAVINGS_ID_COUNTER);
    const startDate = new Date('2026-01-01T00:00:00.000Z');
    const endDate = new Date('2027-01-01T00:00:00.000Z');
    service.create({
      name: '적금',
      status: 'active',
      interestRate: 3.5,
      bank: '신한',
      startDate,
      endDate,
      monthlyAmount: 500000,
      paidMonths: 3,
      currentAmount: 1500000,
    });

    const service2 = new SavingsService();
    await service2.hydrate(storageService, STORAGE_KEYS.SAVINGS, STORAGE_KEYS.SAVINGS_ID_COUNTER);

    const product = service2.getAll()[0];
    expect(product.startDate).toBeInstanceOf(Date);
    expect(product.startDate!.toISOString()).toBe(startDate.toISOString());
    expect(product.endDate).toBeInstanceOf(Date);
    expect(product.endDate!.toISOString()).toBe(endDate.toISOString());
  });
});
