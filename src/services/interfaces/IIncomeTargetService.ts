import {
  IncomeTarget,
  CreateIncomeTargetInput,
  UpdateIncomeTargetInput,
} from '../../types';

/**
 * 수입 목표 서비스 인터페이스
 * 수입 목표 CRUD 및 월별 조회 기능 정의
 */
export interface IIncomeTargetService {
  create(input: CreateIncomeTargetInput): IncomeTarget;
  getById(id: string): IncomeTarget | undefined;
  getAll(): IncomeTarget[];
  getByMonth(year: number, month: number): IncomeTarget[];
  update(id: string, input: UpdateIncomeTargetInput): IncomeTarget | undefined;
  delete(id: string): boolean;
  clear(): void;
}
