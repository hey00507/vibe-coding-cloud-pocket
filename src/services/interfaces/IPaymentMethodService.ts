import {
  PaymentMethod,
  CreatePaymentMethodInput,
  UpdatePaymentMethodInput,
} from '../../types';

/**
 * 결제수단 서비스 인터페이스
 * 결제수단 CRUD 기능 정의
 */
export interface IPaymentMethodService {
  /**
   * 새 결제수단 생성
   * @param input 결제수단 생성 데이터
   * @returns 생성된 결제수단
   */
  create(input: CreatePaymentMethodInput): PaymentMethod;

  /**
   * ID로 결제수단 조회
   * @param id 결제수단 ID
   * @returns 결제수단 또는 undefined
   */
  getById(id: string): PaymentMethod | undefined;

  /**
   * 모든 결제수단 조회
   * @returns 결제수단 배열
   */
  getAll(): PaymentMethod[];

  /**
   * 결제수단 수정
   * @param id 결제수단 ID
   * @param input 수정할 데이터
   * @returns 수정된 결제수단 또는 undefined (존재하지 않는 경우)
   */
  update(id: string, input: UpdatePaymentMethodInput): PaymentMethod | undefined;

  /**
   * 결제수단 삭제
   * @param id 결제수단 ID
   * @returns 삭제 성공 여부
   */
  delete(id: string): boolean;

  /**
   * 모든 결제수단 삭제 (테스트용)
   */
  clear(): void;
}
