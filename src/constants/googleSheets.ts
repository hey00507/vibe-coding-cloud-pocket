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
  SETTINGS_CATEGORIES: '설정-카테고리',
  SETTINGS_PAYMENTS: '설정-결제수단',
  YEAR_SUMMARY: (year: number) => `${year}`,
  MONTHS: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
} as const;

// 카테고리 매트릭스 상수
export const CATEGORY_MATRIX = {
  MAX_ROWS: 20,
  MAX_COLS: 16, // 대분류 1 + 소분류 최대 15
} as const;

// 결제수단 상수
export const PAYMENT_MAX_ROWS = 10;

// 셀 범위 (시트 분리 리팩토링 2026-03-18)
export const CELL_RANGES = {
  // 설정 시트 (분리된 시트)
  CATEGORIES: "'설정-카테고리'!A1:P20",            // 대분류(A열) + 소분류(B~P열), 20행×16열
  PAYMENT_CREDIT: "'설정-결제수단'!A1:A10",        // 신용카드 목록 (A열, 최대 10행)
  PAYMENT_DEBIT: "'설정-결제수단'!B1:B10",         // 체크/현금 목록 (B열, 최대 10행)

  // 설정 시트 (미사용 — 향후 기능 구현 시 분리 예정)
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
