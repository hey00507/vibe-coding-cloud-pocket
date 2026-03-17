import { TransactionService } from './TransactionService';
import { CategoryService } from './CategoryService';
import { PaymentMethodService } from './PaymentMethodService';
import { SubCategoryService } from './SubCategoryService';
import { SeedService } from './SeedService';
import { IncomeTargetService } from './IncomeTargetService';
import { SavingsService } from './SavingsService';
import { BankAccountService } from './BankAccountService';
import { BudgetService } from './BudgetService';
import { GoogleAuthService } from './GoogleAuthService';
import { GoogleSheetsService } from './GoogleSheetsService';

// 전역 서비스 싱글톤 인스턴스
export const transactionService = new TransactionService();
export const categoryService = new CategoryService();
export const paymentMethodService = new PaymentMethodService();
export const subCategoryService = new SubCategoryService();
export const seedService = new SeedService();
export const incomeTargetService = new IncomeTargetService();
export const savingsService = new SavingsService();
export const bankAccountService = new BankAccountService();
export const budgetService = new BudgetService();
export const googleAuthService = new GoogleAuthService();
export const googleSheetsService = new GoogleSheetsService({
  getAccessToken: () => googleAuthService.getAccessToken(),
  transactionService,
  categoryService,
  paymentMethodService,
  subCategoryService,
});
