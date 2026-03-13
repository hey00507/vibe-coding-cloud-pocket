// Google Auth 관련
export interface GoogleAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // timestamp
}

// 동기화 상태
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface SyncResult {
  status: 'success' | 'error';
  message: string;
  timestamp: Date;
  recordCounts?: {
    transactions: number;
    categories: number;
    subCategories: number;
    paymentMethods: number;
    incomeTargets: number;
    savings: number;
    bankAccounts: number;
  };
}

// 시트 데이터 행
export interface SheetRow {
  values: (string | number | null)[];
}
