import {
  SubCategory,
  CreateSubCategoryInput,
  UpdateSubCategoryInput,
} from '../../types';

/**
 * 소분류 카테고리 서비스 인터페이스
 * 소분류 CRUD 및 대분류별 조회 기능 정의
 */
export interface ISubCategoryService {
  /**
   * 새 소분류 생성
   * @param input 소분류 생성 데이터
   * @returns 생성된 소분류
   */
  create(input: CreateSubCategoryInput): SubCategory;

  /**
   * ID로 소분류 조회
   * @param id 소분류 ID
   * @returns 소분류 또는 undefined
   */
  getById(id: string): SubCategory | undefined;

  /**
   * 모든 소분류 조회
   * @returns 소분류 배열
   */
  getAll(): SubCategory[];

  /**
   * 대분류별 소분류 조회
   * @param categoryId 대분류 ID
   * @returns 해당 대분류의 소분류 배열
   */
  getByCategoryId(categoryId: string): SubCategory[];

  /**
   * 소분류 수정
   * @param id 소분류 ID
   * @param input 수정할 데이터
   * @returns 수정된 소분류 또는 undefined
   */
  update(id: string, input: UpdateSubCategoryInput): SubCategory | undefined;

  /**
   * 소분류 삭제
   * @param id 소분류 ID
   * @returns 삭제 성공 여부
   */
  delete(id: string): boolean;

  /**
   * 모든 소분류 삭제 (테스트용)
   */
  clear(): void;
}
