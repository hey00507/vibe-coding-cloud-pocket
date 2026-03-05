import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaymentMethodService } from '../../src/services/PaymentMethodService';
import { StorageService } from '../../src/services/StorageService';
import { STORAGE_KEYS } from '../../src/constants/storageKeys';

describe('PaymentMethodService persistence', () => {
  let service: PaymentMethodService;
  let storageService: StorageService;

  beforeEach(async () => {
    await AsyncStorage.clear();
    service = new PaymentMethodService();
    storageService = new StorageService();
  });

  it('should hydrate data from AsyncStorage', async () => {
    const stored = [
      { id: 'pm-1', name: '신한카드', icon: '💳', type: 'credit' },
    ];
    await AsyncStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(stored));
    await AsyncStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS_ID_COUNTER, JSON.stringify(3));

    await service.hydrate(storageService, STORAGE_KEYS.PAYMENT_METHODS, STORAGE_KEYS.PAYMENT_METHODS_ID_COUNTER);

    expect(service.getAll()).toHaveLength(1);
    expect(service.getById('pm-1')?.name).toBe('신한카드');
  });

  it('should restore idCounter and avoid ID collision', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS_ID_COUNTER, JSON.stringify(5));

    await service.hydrate(storageService, STORAGE_KEYS.PAYMENT_METHODS, STORAGE_KEYS.PAYMENT_METHODS_ID_COUNTER);
    const created = service.create({ name: '현금', icon: '💵', type: 'cash' });

    expect(created.id).toContain('payment-method-6-');
  });

  it('should persist data after create', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.PAYMENT_METHODS, STORAGE_KEYS.PAYMENT_METHODS_ID_COUNTER);

    service.create({ name: '신한카드', icon: '💳', type: 'credit' });

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
    const items = JSON.parse(stored!);
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('신한카드');
  });

  it('should persist data after update', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.PAYMENT_METHODS, STORAGE_KEYS.PAYMENT_METHODS_ID_COUNTER);
    const created = service.create({ name: '신한카드', icon: '💳', type: 'credit' });

    service.update(created.id, { name: '현대카드' });

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
    const items = JSON.parse(stored!);
    expect(items[0].name).toBe('현대카드');
  });

  it('should persist data after delete', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.PAYMENT_METHODS, STORAGE_KEYS.PAYMENT_METHODS_ID_COUNTER);
    const created = service.create({ name: '신한카드', icon: '💳', type: 'credit' });

    service.delete(created.id);

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
    const items = JSON.parse(stored!);
    expect(items).toHaveLength(0);
  });

  it('should not persist when delete returns false', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.PAYMENT_METHODS, STORAGE_KEYS.PAYMENT_METHODS_ID_COUNTER);
    const saveSpy = jest.spyOn(storageService, 'save');

    service.delete('nonexistent');

    expect(saveSpy).not.toHaveBeenCalled();
    saveSpy.mockRestore();
  });

  it('should persist data after clear', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.PAYMENT_METHODS, STORAGE_KEYS.PAYMENT_METHODS_ID_COUNTER);
    service.create({ name: '신한카드', icon: '💳', type: 'credit' });

    service.clear();

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
    const items = JSON.parse(stored!);
    expect(items).toHaveLength(0);
  });

  it('should round-trip data correctly', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.PAYMENT_METHODS, STORAGE_KEYS.PAYMENT_METHODS_ID_COUNTER);
    service.create({ name: '신한카드', icon: '💳', type: 'credit' });

    const service2 = new PaymentMethodService();
    await service2.hydrate(storageService, STORAGE_KEYS.PAYMENT_METHODS, STORAGE_KEYS.PAYMENT_METHODS_ID_COUNTER);

    expect(service2.getAll()).toHaveLength(1);
    expect(service2.getAll()[0].type).toBe('credit');
  });
});
