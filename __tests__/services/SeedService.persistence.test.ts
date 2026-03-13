import AsyncStorage from '@react-native-async-storage/async-storage';
import { SeedService } from '../../src/services/SeedService';
import { CategoryService } from '../../src/services/CategoryService';
import { SubCategoryService } from '../../src/services/SubCategoryService';
import { PaymentMethodService } from '../../src/services/PaymentMethodService';
import { StorageService } from '../../src/services/StorageService';
import { STORAGE_KEYS } from '../../src/constants/storageKeys';

describe('SeedService persistence', () => {
  let seedService: SeedService;
  let storageService: StorageService;
  let categoryService: CategoryService;
  let subCategoryService: SubCategoryService;
  let paymentMethodService: PaymentMethodService;

  beforeEach(async () => {
    await AsyncStorage.clear();
    seedService = new SeedService();
    storageService = new StorageService();
    categoryService = new CategoryService();
    subCategoryService = new SubCategoryService();
    paymentMethodService = new PaymentMethodService();
  });

  it('should hydrate seeded flag from AsyncStorage', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.SEEDED, JSON.stringify(true));

    await seedService.hydrate(storageService, STORAGE_KEYS.SEEDED);

    expect(seedService.isSeeded()).toBe(true);
  });

  it('should default to false when no stored value', async () => {
    await seedService.hydrate(storageService, STORAGE_KEYS.SEEDED);

    expect(seedService.isSeeded()).toBe(false);
  });

  it('should persist seeded flag after seedAll', async () => {
    await seedService.hydrate(storageService, STORAGE_KEYS.SEEDED);

    seedService.seedAll(categoryService, subCategoryService, paymentMethodService);

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.SEEDED);
    expect(JSON.parse(stored!)).toBe(true);
  });

  it('should persist seeded flag after markSeeded', async () => {
    await seedService.hydrate(storageService, STORAGE_KEYS.SEEDED);

    seedService.markSeeded();

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.SEEDED);
    expect(JSON.parse(stored!)).toBe(true);
  });

  it('should persist seeded flag after resetSeeded', async () => {
    await seedService.hydrate(storageService, STORAGE_KEYS.SEEDED);
    seedService.markSeeded();

    seedService.resetSeeded();

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.SEEDED);
    expect(JSON.parse(stored!)).toBe(false);
  });

  it('should prevent re-seeding after restart when already seeded', async () => {
    // First run: seed
    await seedService.hydrate(storageService, STORAGE_KEYS.SEEDED);
    seedService.seedAll(categoryService, subCategoryService, paymentMethodService);

    const catCount = categoryService.getAll().length;

    // Second run: new service, hydrate from storage
    const seedService2 = new SeedService();
    await seedService2.hydrate(storageService, STORAGE_KEYS.SEEDED);

    const categoryService2 = new CategoryService();
    const subCategoryService2 = new SubCategoryService();
    const paymentMethodService2 = new PaymentMethodService();

    seedService2.seedAll(categoryService2, subCategoryService2, paymentMethodService2);

    // Should not have seeded again — categoryService2 should be empty
    expect(categoryService2.getAll()).toHaveLength(0);
    expect(seedService2.isSeeded()).toBe(true);
  });
});
