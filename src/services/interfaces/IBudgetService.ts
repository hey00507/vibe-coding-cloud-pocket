import {
  Budget,
  CreateBudgetInput,
  UpdateBudgetInput,
  BudgetProgress,
} from '../../types';

/**
 * 예산 서비스 인터페이스
 * 카테고리별 월간 예산 CRUD + 소진률 계산
 */
export interface IBudgetService {
  create(input: CreateBudgetInput): Budget;
  getById(id: string): Budget | undefined;
  getAll(): Budget[];
  getByMonth(year: number, month: number): Budget[];
  getByCategoryAndMonth(
    categoryId: string,
    year: number,
    month: number
  ): Budget | undefined;
  update(id: string, input: UpdateBudgetInput): Budget | undefined;
  delete(id: string): boolean;
  clear(): void;

  /**
   * 특정 월의 카테고리별 예산 소진 현황 계산
   * @param year 연도
   * @param month 월 (1-12)
   * @param expenses 카테고리별 지출 맵 (categoryId → 지출 합계)
   * @param categoryNames 카테고리 이름 맵 (categoryId → 이름)
   * @returns 소진률 높은 순으로 정렬된 BudgetProgress 배열
   */
  getProgress(
    year: number,
    month: number,
    expenses: Map<string, number>,
    categoryNames: Map<string, string>
  ): BudgetProgress[];

  /**
   * 특정 월의 전체 예산 대비 전체 지출 소진 현황
   */
  getTotalProgress(
    year: number,
    month: number,
    totalExpense: number
  ): { budget: number; spent: number; remaining: number; percentage: number; status: import('../../types').BudgetStatus };

  /**
   * 이전 월 예산을 현재 월로 복사 (아직 현재 월 예산이 없는 경우만)
   * @returns 복사된 예산 수
   */
  copyFromPreviousMonth(year: number, month: number): number;
}
