import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubCategoryService } from '../../src/services/SubCategoryService';
import { StorageService } from '../../src/services/StorageService';
import { STORAGE_KEYS } from '../../src/constants/storageKeys';

describe('SubCategoryService persistence', () => {
  let service: SubCategoryService;
  let storageService: StorageService;

  beforeEach(async () => {
    await AsyncStorage.clear();
    service = new SubCategoryService();
    storageService = new StorageService();
  });

  it('should hydrate data from AsyncStorage', async () => {
    const stored = [
      { id: 'sc-1', categoryId: 'cat-1', name: '외식', icon: '🍽️' },
      { id: 'sc-2', categoryId: 'cat-1', name: '배달', icon: '🛵' },
    ];
    await AsyncStorage.setItem(STORAGE_KEYS.SUB_CATEGORIES, JSON.stringify(stored));
    await AsyncStorage.setItem(STORAGE_KEYS.SUB_CATEGORIES_ID_COUNTER, JSON.stringify(5));

    await service.hydrate(storageService, STORAGE_KEYS.SUB_CATEGORIES, STORAGE_KEYS.SUB_CATEGORIES_ID_COUNTER);

    expect(service.getAll()).toHaveLength(2);
    expect(service.getById('sc-1')?.name).toBe('외식');
  });

  it('should restore idCounter and avoid ID collision', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.SUB_CATEGORIES_ID_COUNTER, JSON.stringify(8));

    await service.hydrate(storageService, STORAGE_KEYS.SUB_CATEGORIES, STORAGE_KEYS.SUB_CATEGORIES_ID_COUNTER);
    const created = service.create({ categoryId: 'cat-1', name: '간식', icon: '🍪' });

    expect(created.id).toContain('sub-category-9-');
  });

  it('should persist data after create', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.SUB_CATEGORIES, STORAGE_KEYS.SUB_CATEGORIES_ID_COUNTER);

    service.create({ categoryId: 'cat-1', name: '외식', icon: '🍽️' });

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.SUB_CATEGORIES);
    const items = JSON.parse(stored!);
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('외식');
  });

  it('should persist data after update', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.SUB_CATEGORIES, STORAGE_KEYS.SUB_CATEGORIES_ID_COUNTER);
    const created = service.create({ categoryId: 'cat-1', name: '외식', icon: '🍽️' });

    service.update(created.id, { name: '레스토랑' });

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.SUB_CATEGORIES);
    const items = JSON.parse(stored!);
    expect(items[0].name).toBe('레스토랑');
  });

  it('should persist data after delete', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.SUB_CATEGORIES, STORAGE_KEYS.SUB_CATEGORIES_ID_COUNTER);
    const created = service.create({ categoryId: 'cat-1', name: '외식', icon: '🍽️' });

    service.delete(created.id);

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.SUB_CATEGORIES);
    const items = JSON.parse(stored!);
    expect(items).toHaveLength(0);
  });

  it('should not persist when delete returns false', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.SUB_CATEGORIES, STORAGE_KEYS.SUB_CATEGORIES_ID_COUNTER);
    const saveSpy = jest.spyOn(storageService, 'save');

    service.delete('nonexistent');

    expect(saveSpy).not.toHaveBeenCalled();
    saveSpy.mockRestore();
  });

  it('should persist data after clear', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.SUB_CATEGORIES, STORAGE_KEYS.SUB_CATEGORIES_ID_COUNTER);
    service.create({ categoryId: 'cat-1', name: '외식', icon: '🍽️' });

    service.clear();

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.SUB_CATEGORIES);
    const items = JSON.parse(stored!);
    expect(items).toHaveLength(0);
  });

  it('should round-trip data correctly', async () => {
    await service.hydrate(storageService, STORAGE_KEYS.SUB_CATEGORIES, STORAGE_KEYS.SUB_CATEGORIES_ID_COUNTER);
    service.create({ categoryId: 'cat-1', name: '외식', icon: '🍽️' });

    const service2 = new SubCategoryService();
    await service2.hydrate(storageService, STORAGE_KEYS.SUB_CATEGORIES, STORAGE_KEYS.SUB_CATEGORIES_ID_COUNTER);

    expect(service2.getAll()).toHaveLength(1);
    expect(service2.getAll()[0].categoryId).toBe('cat-1');
  });
});
