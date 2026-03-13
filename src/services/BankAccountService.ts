import {
  BankAccount,
  CreateBankAccountInput,
  UpdateBankAccountInput,
  BankTier,
} from '../types';
import { IBankAccountService } from './interfaces/IBankAccountService';
import { IStorageService } from './interfaces/IStorageService';

export class BankAccountService implements IBankAccountService {
  private accounts: Map<string, BankAccount> = new Map();
  private idCounter: number = 0;
  private storageService: IStorageService | null = null;
  private storageKey: string = '';
  private idCounterKey: string = '';

  async hydrate(
    storageService: IStorageService,
    storageKey: string,
    idCounterKey: string
  ): Promise<void> {
    this.storageService = storageService;
    this.storageKey = storageKey;
    this.idCounterKey = idCounterKey;

    const items = await storageService.load<BankAccount>(storageKey);
    for (const item of items) {
      this.accounts.set(item.id, item);
    }

    const counter = await storageService.loadValue<number>(idCounterKey);
    if (counter !== null) {
      this.idCounter = counter;
    }
  }

  private persist(): void {
    if (!this.storageService) return;
    const items = Array.from(this.accounts.values());
    this.storageService.save(this.storageKey, items);
    this.storageService.saveValue(this.idCounterKey, this.idCounter);
  }

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
    this.persist();
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
    this.persist();
    return updated;
  }

  delete(id: string): boolean {
    const result = this.accounts.delete(id);
    if (result) this.persist();
    return result;
  }

  clear(): void {
    this.accounts.clear();
    this.idCounter = 0;
    this.persist();
  }
}
