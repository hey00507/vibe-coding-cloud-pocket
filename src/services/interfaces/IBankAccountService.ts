import {
  BankAccount,
  CreateBankAccountInput,
  UpdateBankAccountInput,
  BankTier,
} from '../../types';

export interface IBankAccountService {
  create(input: CreateBankAccountInput): BankAccount;
  getById(id: string): BankAccount | undefined;
  getAll(): BankAccount[];
  getByTier(tier: BankTier): BankAccount[];
  getTotalAssets(): number;
  getActiveAccounts(): BankAccount[];
  update(id: string, input: UpdateBankAccountInput): BankAccount | undefined;
  delete(id: string): boolean;
  clear(): void;
}
