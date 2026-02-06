import {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionType,
  DailySummary,
  PeriodSummary,
  CategoryBreakdown,
  PaymentMethodBreakdown,
} from '../../types';

/**
 * 거래 서비스 인터페이스
 * 거래 CRUD 및 다양한 조회 기능 정의
 */
export interface ITransactionService {
  /**
   * 새 거래 생성
   * @param input 거래 생성 데이터
   * @returns 생성된 거래
   */
  create(input: CreateTransactionInput): Transaction;

  /**
   * ID로 거래 조회
   * @param id 거래 ID
   * @returns 거래 또는 undefined
   */
  getById(id: string): Transaction | undefined;

  /**
   * 모든 거래 조회
   * @returns 거래 배열
   */
  getAll(): Transaction[];

  /**
   * 거래 유형별 조회
   * @param type 거래 유형 (income | expense)
   * @returns 해당 유형의 거래 배열
   */
  getByType(type: TransactionType): Transaction[];

  /**
   * 날짜 범위로 거래 조회
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @returns 해당 기간의 거래 배열
   */
  getByDateRange(startDate: Date, endDate: Date): Transaction[];

  /**
   * 카테고리별 거래 조회
   * @param categoryId 카테고리 ID
   * @returns 해당 카테고리의 거래 배열
   */
  getByCategoryId(categoryId: string): Transaction[];

  /**
   * 결제수단별 거래 조회
   * @param paymentMethodId 결제수단 ID
   * @returns 해당 결제수단의 거래 배열
   */
  getByPaymentMethodId(paymentMethodId: string): Transaction[];

  /**
   * 거래 수정
   * @param id 거래 ID
   * @param input 수정할 데이터
   * @returns 수정된 거래 또는 undefined (존재하지 않는 경우)
   */
  update(id: string, input: UpdateTransactionInput): Transaction | undefined;

  /**
   * 거래 삭제
   * @param id 거래 ID
   * @returns 삭제 성공 여부
   */
  delete(id: string): boolean;

  /**
   * 모든 거래 삭제 (테스트용)
   */
  clear(): void;

  /**
   * 총 수입 계산
   * @returns 총 수입 금액
   */
  getTotalIncome(): number;

  /**
   * 총 지출 계산
   * @returns 총 지출 금액
   */
  getTotalExpense(): number;

  /**
   * 잔액 계산 (수입 - 지출)
   * @returns 잔액
   */
  getBalance(): number;

  /**
   * 특정 날짜의 거래 조회
   * @param date 조회할 날짜
   * @returns 해당 날짜의 거래 배열
   */
  getByDate(date: Date): Transaction[];

  /**
   * 특정 월의 일별 요약 조회
   * @param year 연도
   * @param month 월 (1-12)
   * @returns 해당 월의 일별 요약 배열
   */
  getDailySummaries(year: number, month: number): DailySummary[];

  /**
   * 월별 요약 조회
   * @param year 연도
   * @param month 월 (1-12)
   * @returns 해당 월의 수입/지출/잔액/거래수
   */
  getMonthlySummary(year: number, month: number): PeriodSummary;

  /**
   * 연도별 요약 조회
   * @param year 연도
   * @returns 해당 연도의 수입/지출/잔액/거래수
   */
  getYearlySummary(year: number): PeriodSummary;

  /**
   * 카테고리별 집계 조회
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @param type 거래 유형 필터 (선택)
   * @returns 카테고리별 금액/비율 배열 (금액 내림차순)
   */
  getCategoryBreakdown(
    startDate: Date,
    endDate: Date,
    type?: TransactionType
  ): CategoryBreakdown[];

  /**
   * 결제수단별 집계 조회
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @param type 거래 유형 필터 (선택)
   * @returns 결제수단별 금액/비율 배열 (금액 내림차순)
   */
  getPaymentMethodBreakdown(
    startDate: Date,
    endDate: Date,
    type?: TransactionType
  ): PaymentMethodBreakdown[];
}
