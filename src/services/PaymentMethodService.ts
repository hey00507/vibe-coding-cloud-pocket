import {
  PaymentMethod,
  CreatePaymentMethodInput,
  UpdatePaymentMethodInput,
} from '../types';
import { IPaymentMethodService } from './interfaces/IPaymentMethodService';

/**
 * 결제수단 서비스 구현체
 * 메모리 캐시 기반으로 결제수단 CRUD 기능 제공
 */
export class PaymentMethodService implements IPaymentMethodService {
  private paymentMethods: Map<string, PaymentMethod> = new Map();
  private idCounter: number = 0;

  private generateId(): string {
    this.idCounter += 1;
    return `payment-method-${this.idCounter}-${Date.now()}`;
  }

  create(input: CreatePaymentMethodInput): PaymentMethod {
    const paymentMethod: PaymentMethod = {
      id: this.generateId(),
      name: input.name,
      icon: input.icon,
    };

    this.paymentMethods.set(paymentMethod.id, paymentMethod);
    return paymentMethod;
  }

  getById(id: string): PaymentMethod | undefined {
    return this.paymentMethods.get(id);
  }

  getAll(): PaymentMethod[] {
    return Array.from(this.paymentMethods.values());
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
    return updated;
  }

  delete(id: string): boolean {
    return this.paymentMethods.delete(id);
  }

  clear(): void {
    this.paymentMethods.clear();
    this.idCounter = 0;
  }
}
