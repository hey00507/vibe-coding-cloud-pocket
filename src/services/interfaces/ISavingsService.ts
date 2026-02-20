import {
  SavingsProduct,
  CreateSavingsProductInput,
  UpdateSavingsProductInput,
  SavingsProductStatus,
} from '../../types';

export interface ISavingsService {
  create(input: CreateSavingsProductInput): SavingsProduct;
  getById(id: string): SavingsProduct | undefined;
  getAll(): SavingsProduct[];
  getByStatus(status: SavingsProductStatus): SavingsProduct[];
  getTotalCurrentAmount(): number;
  getMonthlySavingsTotal(): number;
  update(id: string, input: UpdateSavingsProductInput): SavingsProduct | undefined;
  delete(id: string): boolean;
  clear(): void;
}
