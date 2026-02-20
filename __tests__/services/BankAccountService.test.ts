import { BankAccountService } from '../../src/services/BankAccountService';
import { IBankAccountService } from '../../src/services/interfaces/IBankAccountService';
import { CreateBankAccountInput } from '../../src/types';

describe('BankAccountService', () => {
  let service: IBankAccountService;

  const createTestInput = (
    overrides: Partial<CreateBankAccountInput> = {}
  ): CreateBankAccountInput => ({
    bank: '국민은행',
    purpose: '급여통장',
    balance: 5000000,
    tier: 'primary',
    isActive: true,
    ...overrides,
  });

  beforeEach(() => {
    service = new BankAccountService();
  });

  describe('create', () => {
    it('should create a new bank account with generated id', () => {
      const input = createTestInput();

      const result = service.create(input);

      expect(result.id).toBeDefined();
      expect(result.id).toMatch(/^bank-account-/);
      expect(result.bank).toBe('국민은행');
      expect(result.purpose).toBe('급여통장');
      expect(result.balance).toBe(5000000);
      expect(result.tier).toBe('primary');
      expect(result.isActive).toBe(true);
    });

    it('should generate unique ids for each account', () => {
      const result1 = service.create(createTestInput());
      const result2 = service.create(createTestInput({ bank: '신한은행' }));

      expect(result1.id).not.toBe(result2.id);
    });

    it('should create inactive account', () => {
      const result = service.create(createTestInput({ isActive: false }));

      expect(result.isActive).toBe(false);
    });

    it('should create account with different tiers', () => {
      const primary = service.create(createTestInput({ tier: 'primary' }));
      const secondary = service.create(createTestInput({ tier: 'secondary' }));
      const savingsBank = service.create(createTestInput({ tier: 'savings_bank' }));

      expect(primary.tier).toBe('primary');
      expect(secondary.tier).toBe('secondary');
      expect(savingsBank.tier).toBe('savings_bank');
    });
  });

  describe('getById', () => {
    it('should return account when found', () => {
      const created = service.create(createTestInput());

      const result = service.getById(created.id);

      expect(result).toEqual(created);
    });

    it('should return undefined when not found', () => {
      const result = service.getById('non-existent-id');

      expect(result).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return empty array when no accounts exist', () => {
      const result = service.getAll();

      expect(result).toEqual([]);
    });

    it('should return all accounts', () => {
      service.create(createTestInput());
      service.create(createTestInput({ bank: '신한은행' }));
      service.create(createTestInput({ bank: '우리은행' }));

      const result = service.getAll();

      expect(result).toHaveLength(3);
    });
  });

  describe('getByTier', () => {
    beforeEach(() => {
      service.create(createTestInput({ bank: '국민은행', tier: 'primary' }));
      service.create(createTestInput({ bank: '신한은행', tier: 'primary' }));
      service.create(createTestInput({ bank: '카카오뱅크', tier: 'secondary' }));
      service.create(createTestInput({ bank: 'SBI저축은행', tier: 'savings_bank' }));
    });

    it('should return only primary tier accounts', () => {
      const result = service.getByTier('primary');

      expect(result).toHaveLength(2);
      expect(result.every((a) => a.tier === 'primary')).toBe(true);
    });

    it('should return only secondary tier accounts', () => {
      const result = service.getByTier('secondary');

      expect(result).toHaveLength(1);
      expect(result[0].tier).toBe('secondary');
    });

    it('should return only savings_bank tier accounts', () => {
      const result = service.getByTier('savings_bank');

      expect(result).toHaveLength(1);
      expect(result[0].tier).toBe('savings_bank');
    });

    it('should return empty array when no accounts of tier exist', () => {
      service.clear();
      service.create(createTestInput({ tier: 'primary' }));

      const result = service.getByTier('secondary');

      expect(result).toEqual([]);
    });
  });

  describe('getTotalAssets', () => {
    it('should return 0 when no accounts exist', () => {
      const result = service.getTotalAssets();

      expect(result).toBe(0);
    });

    it('should return sum of active account balances only', () => {
      service.create(createTestInput({ balance: 5000000, isActive: true }));
      service.create(createTestInput({ balance: 3000000, isActive: true }));
      service.create(createTestInput({ balance: 2000000, isActive: false }));

      const result = service.getTotalAssets();

      expect(result).toBe(8000000);
    });

    it('should return 0 when only inactive accounts exist', () => {
      service.create(createTestInput({ balance: 5000000, isActive: false }));
      service.create(createTestInput({ balance: 3000000, isActive: false }));

      const result = service.getTotalAssets();

      expect(result).toBe(0);
    });
  });

  describe('getActiveAccounts', () => {
    it('should return empty array when no accounts exist', () => {
      const result = service.getActiveAccounts();

      expect(result).toEqual([]);
    });

    it('should return only active accounts', () => {
      service.create(createTestInput({ bank: '국민은행', isActive: true }));
      service.create(createTestInput({ bank: '신한은행', isActive: false }));
      service.create(createTestInput({ bank: '우리은행', isActive: true }));

      const result = service.getActiveAccounts();

      expect(result).toHaveLength(2);
      expect(result.every((a) => a.isActive)).toBe(true);
    });

    it('should return empty array when all accounts are inactive', () => {
      service.create(createTestInput({ isActive: false }));
      service.create(createTestInput({ isActive: false }));

      const result = service.getActiveAccounts();

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update account balance', () => {
      const created = service.create(createTestInput({ balance: 5000000 }));

      const result = service.update(created.id, { balance: 6000000 });

      expect(result).toBeDefined();
      expect(result!.balance).toBe(6000000);
      expect(result!.bank).toBe('국민은행');
    });

    it('should update account active status', () => {
      const created = service.create(createTestInput({ isActive: true }));

      const result = service.update(created.id, { isActive: false });

      expect(result).toBeDefined();
      expect(result!.isActive).toBe(false);
    });

    it('should update multiple fields at once', () => {
      const created = service.create(createTestInput());

      const result = service.update(created.id, {
        purpose: '저축통장',
        balance: 10000000,
        tier: 'secondary',
      });

      expect(result).toBeDefined();
      expect(result!.purpose).toBe('저축통장');
      expect(result!.balance).toBe(10000000);
      expect(result!.tier).toBe('secondary');
    });

    it('should return undefined when account not found', () => {
      const result = service.update('non-existent-id', { balance: 100 });

      expect(result).toBeUndefined();
    });

    it('should persist update in storage', () => {
      const created = service.create(createTestInput({ balance: 5000000 }));
      service.update(created.id, { balance: 7000000 });

      const fetched = service.getById(created.id);

      expect(fetched!.balance).toBe(7000000);
    });
  });

  describe('delete', () => {
    it('should delete existing account and return true', () => {
      const created = service.create(createTestInput());

      const result = service.delete(created.id);

      expect(result).toBe(true);
      expect(service.getById(created.id)).toBeUndefined();
    });

    it('should return false when account not found', () => {
      const result = service.delete('non-existent-id');

      expect(result).toBe(false);
    });

    it('should not affect other accounts', () => {
      const a1 = service.create(createTestInput({ bank: '국민은행' }));
      const a2 = service.create(createTestInput({ bank: '신한은행' }));

      service.delete(a1.id);

      expect(service.getById(a2.id)).toBeDefined();
      expect(service.getAll()).toHaveLength(1);
    });
  });

  describe('clear', () => {
    it('should remove all accounts', () => {
      service.create(createTestInput());
      service.create(createTestInput({ bank: '신한은행' }));

      service.clear();

      expect(service.getAll()).toEqual([]);
    });

    it('should reset id counter', () => {
      service.create(createTestInput());
      service.clear();

      const newAccount = service.create(createTestInput());

      expect(newAccount.id).toMatch(/^bank-account-1-/);
    });
  });
});
