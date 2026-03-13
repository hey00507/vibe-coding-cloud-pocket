import { StorageService } from './StorageService';
import { STORAGE_KEYS } from '../constants/storageKeys';
import {
  categoryService,
  subCategoryService,
  paymentMethodService,
  transactionService,
  incomeTargetService,
  savingsService,
  bankAccountService,
  seedService,
} from './ServiceRegistry';

export async function initializeApp(): Promise<void> {
  const storageService = new StorageService();

  // 1. SeedService hydrate (seeded 플래그 복원)
  await seedService.hydrate(storageService, STORAGE_KEYS.SEEDED);

  // 2. 7개 데이터 서비스 병렬 hydrate
  await Promise.all([
    categoryService.hydrate(
      storageService,
      STORAGE_KEYS.CATEGORIES,
      STORAGE_KEYS.CATEGORIES_ID_COUNTER
    ),
    subCategoryService.hydrate(
      storageService,
      STORAGE_KEYS.SUB_CATEGORIES,
      STORAGE_KEYS.SUB_CATEGORIES_ID_COUNTER
    ),
    paymentMethodService.hydrate(
      storageService,
      STORAGE_KEYS.PAYMENT_METHODS,
      STORAGE_KEYS.PAYMENT_METHODS_ID_COUNTER
    ),
    transactionService.hydrate(
      storageService,
      STORAGE_KEYS.TRANSACTIONS,
      STORAGE_KEYS.TRANSACTIONS_ID_COUNTER
    ),
    incomeTargetService.hydrate(
      storageService,
      STORAGE_KEYS.INCOME_TARGETS,
      STORAGE_KEYS.INCOME_TARGETS_ID_COUNTER
    ),
    savingsService.hydrate(
      storageService,
      STORAGE_KEYS.SAVINGS,
      STORAGE_KEYS.SAVINGS_ID_COUNTER
    ),
    bankAccountService.hydrate(
      storageService,
      STORAGE_KEYS.BANK_ACCOUNTS,
      STORAGE_KEYS.BANK_ACCOUNTS_ID_COUNTER
    ),
  ]);

  // 3. 미시딩 시 초기 데이터 세팅
  if (!seedService.isSeeded()) {
    seedService.seedAll(categoryService, subCategoryService, paymentMethodService);
  }
}
