import {
  PaymentMethod,
  CreatePaymentMethodInput,
  UpdatePaymentMethodInput,
  PaymentMethodType,
} from '../types';
import { IPaymentMethodService } from './interfaces/IPaymentMethodService';
import { IStorageService } from './interfaces/IStorageService';

/**
 * 결제수단 서비스 구현체
 * 메모리 캐시 기반으로 결제수단 CRUD 기능 제공
 */
export class PaymentMethodService implements IPaymentMethodService {
  private paymentMethods: Map<string, PaymentMethod> = new Map();
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

    const items = await storageService.load<PaymentMethod>(storageKey);
    for (const item of items) {
      this.paymentMethods.set(item.id, item);
    }

    const counter = await storageService.loadValue<number>(idCounterKey);
    if (counter !== null) {
      this.idCounter = counter;
    }
  }

  private persist(): void {
    if (!this.storageService) return;
    const items = Array.from(this.paymentMethods.values());
    this.storageService.save(this.storageKey, items);
    this.storageService.saveValue(this.idCounterKey, this.idCounter);
  }

  private generateId(): string {
    this.idCounter += 1;
    return `payment-method-${this.idCounter}-${Date.now()}`;
  }

  create(input: CreatePaymentMethodInput): PaymentMethod {
    const paymentMethod: PaymentMethod = {
      id: this.generateId(),
      name: input.name,
      icon: input.icon,
      type: input.type,
    };

    this.paymentMethods.set(paymentMethod.id, paymentMethod);
    this.persist();
    return paymentMethod;
  }

  getById(id: string): PaymentMethod | undefined {
    return this.paymentMethods.get(id);
  }

  getAll(): PaymentMethod[] {
    return Array.from(this.paymentMethods.values());
  }

  getByType(type: PaymentMethodType): PaymentMethod[] {
    return this.getAll().filter((pm) => pm.type === type);
  }

  update(id: string, input: UpdatePaymentMethodInput): PaymentMethod | undefined {
    const existing = this.paymentMethods.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: PaymentMethod = {
      ...existing,
      ...input,
      id: existing.id,
    };

    this.paymentMethods.set(id, updated);
    this.persist();
    return updated;
  }

  delete(id: string): boolean {
    const result = this.paymentMethods.delete(id);
    if (result) this.persist();
    return result;
  }

  clear(): void {
    this.paymentMethods.clear();
    this.idCounter = 0;
    this.persist();
  }
}
