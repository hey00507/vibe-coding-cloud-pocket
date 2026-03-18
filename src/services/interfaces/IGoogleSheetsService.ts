import { SyncResult } from '../../types/googleSheets';

/**
 * Google Sheets 서비스 인터페이스
 * 스프레드시트 연동을 통한 데이터 내보내기/가져오기 기능 정의
 */
export interface IGoogleSheetsService {
  /**
   * 스프레드시트 ID 설정 (AsyncStorage에 저장)
   * @param id 스프레드시트 ID
   */
  setSpreadsheetId(id: string): Promise<void>;

  /**
   * 현재 설정된 스프레드시트 ID 조회
   * @returns 스프레드시트 ID 또는 null
   */
  getSpreadsheetId(): string | null;

  /**
   * 전체 데이터 내보내기 (거래 + 설정)
   * @returns 동기화 결과
   */
  exportAll(): Promise<SyncResult>;

  /**
   * 특정 월 거래 내보내기
   * @param year 연도
   * @param month 월 (1-12)
   * @returns 동기화 결과
   */
  exportTransactions(year: number, month: number): Promise<SyncResult>;

  /**
   * 설정 데이터 내보내기 (카테고리, 결제수단)
   * @returns 동기화 결과
   */
  exportSettings(): Promise<SyncResult>;

  /**
   * 전체 데이터 가져오기 (거래 + 설정)
   * @returns 동기화 결과
   */
  importAll(year?: number): Promise<SyncResult>;

  /**
   * 특정 월 거래 가져오기
   * @param year 연도
   * @param month 월 (1-12)
   * @returns 동기화 결과
   */
  importTransactions(year: number, month: number): Promise<SyncResult>;

  /**
   * 설정 데이터 가져오기 (카테고리, 결제수단)
   * @returns 동기화 결과
   */
  importSettings(): Promise<SyncResult>;

  /**
   * 마지막 동기화 시간 조회
   * @returns 마지막 동기화 시간 또는 null
   */
  getLastSyncTime(): Date | null;

  /**
   * 스프레드시트 연결 테스트
   * @returns 연결 성공 여부
   */
  testConnection(): Promise<boolean>;
}
