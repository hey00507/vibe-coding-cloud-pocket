import AsyncStorage from '@react-native-async-storage/async-storage';
import { BankAccountService } from '../../src/services/BankAccountService';
import { StorageService } from '../../src/services/StorageService';
import { STORAGE_KEYS } from '../../src/constants/storageKeys';

describe('BankAccountService persistence', () => {
  let service: BankAccountService;
  let storageService: StorageService;

  beforeEach(async () => {
    await AsyncStorage.clear();
    service = new BankAccountService();
    storageService = new StorageService();
  });

  it('should hydrate data from AsyncStorage', async () => {
    const stored = [
      { id: 'ba-1', bank: '신한', purpose: '생활비', balance: 1000000, tier: 'primary', isActive: true },
    ];
    await AsyncStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(stored));
    await AsyncStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS_ID_COUNTER, JSON.stringify(3));

    await service.hydrate(storageService, STORAGE_KEYS.BANK_ACCOUNTS, STORAGE_KEYS.BANK_ACCOUNTS_ID_COUNTER);

    expect(service.getAll()).toHaveLength(1);
    expect(service.getById('ba-1')?.bank).toBe('신한');
  });

  it('should restore idCounter and avoid ID collision', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS_ID_COUNTER, JSON.stringify(6));

    await service.hydrate(storageService, STORAGE_KEYS.BANK_ACCOUNTS, STORAGE_KEYS.BANK_ACCOUNTS_ID_COUNTER);
    const created = service.create({ bank: '국민', purpose: '저축', balance: 0, tier: 'secondary', isActive: true });

    expect(created.id).toContain('bank-account-7-');
  });

  it('should persist data after create', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.BANK_ACCOUNTS, STORAGE_KEYS.BANK_ACCOUNTS_ID_COUNTER);

    service.create({ bank: '신한', purpose: '생활비', balance: 1000000, tier: 'primary', isActive: true });

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.BANK_ACCOUNTS);
    const items = JSON.parse(stored!);
    expect(items).toHaveLength(1);
  });

  it('should persist data after update', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.BANK_ACCOUNTS, STORAGE_KEYS.BANK_ACCOUNTS_ID_COUNTER);
    const created = service.create({ bank: '신한', purpose: '생활비', balance: 1000000, tier: 'primary', isActive: true });

    service.update(created.id, { balance: 2000000 });

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.BANK_ACCOUNTS);
    const items = JSON.parse(stored!);
    expect(items[0].balance).toBe(2000000);
  });

  it('should persist data after delete', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.BANK_ACCOUNTS, STORAGE_KEYS.BANK_ACCOUNTS_ID_COUNTER);
    const created = service.create({ bank: '신한', purpose: '생활비', balance: 1000000, tier: 'primary', isActive: true });

    service.delete(created.id);

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.BANK_ACCOUNTS);
    const items = JSON.parse(stored!);
    expect(items).toHaveLength(0);
  });

  it('should not persist when delete returns false', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.BANK_ACCOUNTS, STORAGE_KEYS.BANK_ACCOUNTS_ID_COUNTER);
    const saveSpy = jest.spyOn(storageService, 'save');

    service.delete('nonexistent');

    expect(saveSpy).not.toHaveBeenCalled();
    saveSpy.mockRestore();
  });

  it('should persist data after clear', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.BANK_ACCOUNTS, STORAGE_KEYS.BANK_ACCOUNTS_ID_COUNTER);
    service.create({ bank: '신한', purpose: '생활비', balance: 1000000, tier: 'primary', isActive: true });

    service.clear();

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.BANK_ACCOUNTS);
    const items = JSON.parse(stored!);
    expect(items).toHaveLength(0);
  });

  it('should round-trip data correctly', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.BANK_ACCOUNTS, STORAGE_KEYS.BANK_ACCOUNTS_ID_COUNTER);
    service.create({ bank: '신한', purpose: '생활비', balance: 1000000, tier: 'primary', isActive: true });
    service.create({ bank: '국민', purpose: '저축', balance: 5000000, tier: 'secondary', isActive: false });

    const service2 = new BankAccountService();
    await service2.hydrate(storageService, STORAGE_KEYS.BANK_ACCOUNTS, STORAGE_KEYS.BANK_ACCOUNTS_ID_COUNTER);

    expect(service2.getAll()).toHaveLength(2);
    expect(service2.getActiveAccounts()).toHaveLength(1);
    expect(service2.getTotalAssets()).toBe(1000000);
  });
});
