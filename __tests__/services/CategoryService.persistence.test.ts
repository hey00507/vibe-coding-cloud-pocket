import AsyncStorage from '@react-native-async-storage/async-storage';
import { CategoryService } from '../../src/services/CategoryService';
import { StorageService } from '../../src/services/StorageService';
import { STORAGE_KEYS } from '../../src/constants/storageKeys';

describe('CategoryService persistence', () => {
  let service: CategoryService;
  let storageService: StorageService;

  beforeEach(async () => {
    await AsyncStorage.clear();
    service = new CategoryService();
    storageService = new StorageService();
  });

  it('should hydrate data from AsyncStorage', async () => {
    const stored = [
      { id: 'cat-1', name: '식비', type: 'expense', icon: '🍔' },
      { id: 'cat-2', name: '급여', type: 'income', icon: '💰' },
    ];
    await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(stored));
    await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES_ID_COUNTER, JSON.stringify(5));

    await service.hydrate(storageService, STORAGE_KEYS.CATEGORIES, STORAGE_KEYS.CATEGORIES_ID_COUNTER);

    expect(service.getAll()).toHaveLength(2);
    expect(service.getById('cat-1')?.name).toBe('식비');
    expect(service.getById('cat-2')?.name).toBe('급여');
  });

  it('should restore idCounter and avoid ID collision', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES_ID_COUNTER, JSON.stringify(10));

    await service.hydrate(storageService, STORAGE_KEYS.CATEGORIES, STORAGE_KEYS.CATEGORIES_ID_COUNTER);
    const created = service.create({ name: '교통비', type: 'expense' });

    expect(created.id).toContain('category-11-');
  });

  it('should persist data after create', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.CATEGORIES, STORAGE_KEYS.CATEGORIES_ID_COUNTER);

    service.create({ name: '식비', type: 'expense' });

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const items = JSON.parse(stored!);
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('식비');
  });

  it('should persist data after update', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.CATEGORIES, STORAGE_KEYS.CATEGORIES_ID_COUNTER);
    const created = service.create({ name: '식비', type: 'expense' });

    service.update(created.id, { name: '외식비' });

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const items = JSON.parse(stored!);
    expect(items[0].name).toBe('외식비');
  });

  it('should persist data after delete', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.CATEGORIES, STORAGE_KEYS.CATEGORIES_ID_COUNTER);
    const created = service.create({ name: '식비', type: 'expense' });

    service.delete(created.id);

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const items = JSON.parse(stored!);
    expect(items).toHaveLength(0);
  });

  it('should not persist when delete returns false', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.CATEGORIES, STORAGE_KEYS.CATEGORIES_ID_COUNTER);
    const saveSpy = jest.spyOn(storageService, 'save');

    service.delete('nonexistent');

    expect(saveSpy).not.toHaveBeenCalled();
    saveSpy.mockRestore();
  });

  it('should persist data after clear', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.CATEGORIES, STORAGE_KEYS.CATEGORIES_ID_COUNTER);
    service.create({ name: '식비', type: 'expense' });

    service.clear();

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const items = JSON.parse(stored!);
    expect(items).toHaveLength(0);
  });

  it('should hydrate with empty storage gracefully', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.CATEGORIES, STORAGE_KEYS.CATEGORIES_ID_COUNTER);

    expect(service.getAll()).toHaveLength(0);
  });

  it('should round-trip data correctly', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.CATEGORIES, STORAGE_KEYS.CATEGORIES_ID_COUNTER);
    service.create({ name: '식비', type: 'expense', icon: '🍔', color: '#FF0000' });
    service.create({ name: '급여', type: 'income', icon: '💰' });

    const service2 = new CategoryService();
    await service2.hydrate(storageService, STORAGE_KEYS.CATEGORIES, STORAGE_KEYS.CATEGORIES_ID_COUNTER);

    expect(service2.getAll()).toHaveLength(2);
    const cat = service2.getAll().find(c => c.name === '식비');
    expect(cat?.icon).toBe('🍔');
    expect(cat?.color).toBe('#FF0000');
  });
});
