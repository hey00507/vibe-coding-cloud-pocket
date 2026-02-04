import {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  TransactionType,
} from '../../types';

/**
 * 카테고리 서비스 인터페이스
 * 카테고리 CRUD 및 조회 기능 정의
 */
export interface ICategoryService {
  /**
   * 새 카테고리 생성
   * @param input 카테고리 생성 데이터
   * @returns 생성된 카테고리
   */
  create(input: CreateCategoryInput): Category;

  /**
   * ID로 카테고리 조회
   * @param id 카테고리 ID
   * @returns 카테고리 또는 undefined
   */
  getById(id: string): Category | undefined;

  /**
   * 모든 카테고리 조회
   * @returns 카테고리 배열
   */
  getAll(): Category[];

  /**
   * 거래 유형별 카테고리 조회
   * @param type 거래 유형 (income | expense)
   * @returns 해당 유형의 카테고리 배열
   */
  getByType(type: TransactionType): Category[];

  /**
   * 카테고리 수정
   * @param id 카테고리 ID
   * @param input 수정할 데이터
   * @returns 수정된 카테고리 또는 undefined (존재하지 않는 경우)
   */
  update(id: string, input: UpdateCategoryInput): Category | undefined;

  /**
   * 카테고리 삭제
   * @param id 카테고리 ID
   * @returns 삭제 성공 여부
   */
  delete(id: string): boolean;

  /**
   * 모든 카테고리 삭제 (테스트용)
   */
  clear(): void;
}
