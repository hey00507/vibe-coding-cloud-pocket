import { PaymentMethodService } from '../../src/services/PaymentMethodService';
import { IPaymentMethodService } from '../../src/services/interfaces/IPaymentMethodService';
import { CreatePaymentMethodInput } from '../../src/types';

describe('PaymentMethodService', () => {
  let service: IPaymentMethodService;

  beforeEach(() => {
    service = new PaymentMethodService();
  });

  describe('create', () => {
    it('should create a new payment method with generated id', () => {
      const input: CreatePaymentMethodInput = {
        name: '신용카드',
        icon: '💳',
      };

      const result = service.create(input);

      expect(result.id).toBeDefined();
      expect(result.name).toBe('신용카드');
      expect(result.icon).toBe('💳');
    });

    it('should create a payment method without optional fields', () => {
      const input: CreatePaymentMethodInput = {
        name: '현금',
      };

      const result = service.create(input);

      expect(result.id).toBeDefined();
      expect(result.name).toBe('현금');
      expect(result.icon).toBeUndefined();
    });

    it('should generate unique ids for each payment method', () => {
      const input1: CreatePaymentMethodInput = { name: '신용카드' };
      const input2: CreatePaymentMethodInput = { name: '체크카드' };

      const result1 = service.create(input1);
      const result2 = service.create(input2);

      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe('getById', () => {
    it('should return payment method when found', () => {
      const input: CreatePaymentMethodInput = { name: '신용카드', icon: '💳' };
      const created = service.create(input);

      const result = service.getById(created.id);

      expect(result).toEqual(created);
    });

    it('should return undefined when not found', () => {
      const result = service.getById('non-existent-id');

      expect(result).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return empty array when no payment methods exist', () => {
      const result = service.getAll();

      expect(result).toEqual([]);
    });

    it('should return all payment methods', () => {
      service.create({ name: '신용카드' });
      service.create({ name: '체크카드' });
      service.create({ name: '현금' });

      const result = service.getAll();

      expect(result).toHaveLength(3);
    });
  });

  describe('update', () => {
    it('should update payment method name', () => {
      const created = service.create({ name: '신용카드' });

      const result = service.update(created.id, { name: '삼성카드' });

      expect(result).toBeDefined();
      expect(result!.name).toBe('삼성카드');
    });

    it('should update payment method icon', () => {
      const created = service.create({ name: '현금' });

      const result = service.update(created.id, { icon: '💵' });

      expect(result).toBeDefined();
      expect(result!.icon).toBe('💵');
    });

    it('should update multiple fields at once', () => {
      const created = service.create({ name: '카드' });

      const result = service.update(created.id, {
        name: '국민카드',
        icon: '💳',
      });

      expect(result).toBeDefined();
      expect(result!.name).toBe('국민카드');
      expect(result!.icon).toBe('💳');
    });

    it('should return undefined when payment method not found', () => {
      const result = service.update('non-existent-id', { name: '새이름' });

      expect(result).toBeUndefined();
    });

    it('should persist update in storage', () => {
      const created = service.create({ name: '신용카드' });
      service.update(created.id, { name: '삼성카드' });

      const fetched = service.getById(created.id);

      expect(fetched!.name).toBe('삼성카드');
    });
  });

  describe('delete', () => {
    it('should delete existing payment method and return true', () => {
      const created = service.create({ name: '신용카드' });

      const result = service.delete(created.id);

      expect(result).toBe(true);
      expect(service.getById(created.id)).toBeUndefined();
    });

    it('should return false when payment method not found', () => {
      const result = service.delete('non-existent-id');

      expect(result).toBe(false);
    });

    it('should not affect other payment methods', () => {
      const pm1 = service.create({ name: '신용카드' });
      const pm2 = service.create({ name: '체크카드' });

      service.delete(pm1.id);

      expect(service.getById(pm2.id)).toBeDefined();
      expect(service.getAll()).toHaveLength(1);
    });
  });

  describe('clear', () => {
    it('should remove all payment methods', () => {
      service.create({ name: '신용카드' });
      service.create({ name: '현금' });

      service.clear();

      expect(service.getAll()).toEqual([]);
    });
  });
});
