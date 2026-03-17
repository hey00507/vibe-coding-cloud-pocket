/**
 * 자동 동기화 서비스 인터페이스
 * 앱 시작 시 / 포그라운드 복귀 시 자동 동기화 트리거
 */
export interface IAutoSyncService {
  /**
   * 자동 동기화 시도. 조건 충족 시 export 실행.
   * 조건: 로그인 + 스프레드시트 ID 설정 + 마지막 동기화가 minInterval 이상 경과
   * @returns 동기화 실행 여부
   */
  syncIfNeeded(): Promise<boolean>;

  /**
   * 동기화가 필요한지 확인 (실행하지 않음)
   */
  shouldSync(): boolean;

  /**
   * AppState 리스너 등록 (background → active 감지)
   */
  startListening(): void;

  /**
   * AppState 리스너 해제
   */
  stopListening(): void;

  /**
   * 마지막 자동 동기화 결과
   */
  getLastAutoSyncResult(): { success: boolean; timestamp: Date | null; error?: string };
}
