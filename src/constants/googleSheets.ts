// Google OAuth 설정
export const GOOGLE_CONFIG = {
  // Expo Go 테스트용 (웹 애플리케이션 타입)
  WEB_CLIENT_ID: '585276003820-f87um3808k8im307c44oletkk3skdh8s.apps.googleusercontent.com',
  // EAS Build 배포용 (iOS 타입)
  IOS_CLIENT_ID: '585276003820-snqbt696bpmru9fld6bi5n2fenainbrr.apps.googleusercontent.com',
  SCOPES: ['https://www.googleapis.com/auth/spreadsheets'],
  TOKEN_ENDPOINT: 'https://oauth2.googleapis.com/token',
} as const;

// Google Sheets API
export const SHEETS_API = {
  BASE_URL: 'https://sheets.googleapis.com/v4/spreadsheets',
} as const;

// 시트명
export const SHEET_NAMES = {
  SETTINGS: '(필수)설정 시트',
  YEAR_SUMMARY: (year: number) => `${year}`,
  MONTHS: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
} as const;

// 셀 범위 (실제 스프레드시트 구조 매핑 2026-03-16)
export const CELL_RANGES = {
  // 설정 시트
  CATEGORIES: "'(필수)설정 시트'!D38:M48",       // 대분류 10개 + 소분류 (행 38~48)
  PAYMENT_CREDIT: "'(필수)설정 시트'!B12:B16",    // 신용카드 목록 (B열, 헤더 B11="신용")
  PAYMENT_DEBIT: "'(필수)설정 시트'!C12:C16",     // 체크카드 목록 (C열, 헤더 C11="체크")
  PAYMENT_HEADERS: "'(필수)설정 시트'!B11:C11",   // 결제수단 헤더 ("신용", "체크")
  INCOME_CATEGORIES: "'(필수)설정 시트'!B30:B36",  // 수입분류 (월급~연금)
  SAVINGS_PRODUCTS: "'(필수)설정 시트'!D3:N9",     // 저축상품 (헤더 포함)
  BANK_ACCOUNTS_1: "'(필수)설정 시트'!A20:F27",   // 1금융권 계좌
  BANK_ACCOUNTS_2: "'(필수)설정 시트'!A28:F29",   // 2금융권 계좌
  CASH: "'(필수)설정 시트'!C14:C16",              // 현금 결제수단

  // 월별 시트 (동적: month 파라미터) — 네이티브 Google Sheets 기준
  EXPENSE_TRANSACTIONS: (month: string) => `'${month}'!G6:L1000`,
  INCOME_DETAILS: (month: string) => `'${month}'!C14:E18`,
  SAVINGS_DETAILS: (month: string) => `'${month}'!C22:E33`,
} as const;
