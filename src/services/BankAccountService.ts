import {
  BankAccount,
  CreateBankAccountInput,
  UpdateBankAccountInput,
  BankTier,
} from '../types';
import { IBankAccountService } from './interfaces/IBankAccountService';

export class BankAccountService implements IBankAccountService {
  private accounts: Map<string, BankAccount> = new Map();
  private idCounter: number = 0;

  private generateId(): string {
    this.idCounter += 1;
    return `bank-account-${this.idCounter}-${Date.now()}`;
  }

  create(input: CreateBankAccountInput): BankAccount {
    const account: BankAccount = {
      id: this.generateId(),
      bank: input.bank,
      purpose: input.purpose,
      balance: input.balance,
      tier: input.tier,
      isActive: input.isActive,
    };

    this.accounts.set(account.id, account);
    return account;
  }

  getById(id: string): BankAccount | undefined {
    return this.accounts.get(id);
  }

  getAll(): BankAccount[] {
    return Array.from(this.accounts.values());
  }

  getByTier(tier: BankTier): BankAccount[] {
    return this.getAll().filter((a) => a.tier === tier);
  }

  getTotalAssets(): number {
    return this.getActiveAccounts().reduce((sum, a) => sum + a.balance, 0);
  }

  getActiveAccounts(): BankAccount[] {
    return this.getAll().filter((a) => a.isActive);
  }

  update(id: string, input: UpdateBankAccountInput): BankAccount | undefined {
    const existing = this.accounts.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: BankAccount = {
      ...existing,
      ...input,
      id: existing.id,
    };

    this.accounts.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.accounts.delete(id);
  }

  clear(): void {
    this.accounts.clear();
    this.idCounter = 0;
  }
}
