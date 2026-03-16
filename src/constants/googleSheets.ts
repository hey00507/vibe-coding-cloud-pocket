// Google OAuth 설정
export const GOOGLE_CONFIG = {
  // Google Cloud Console에서 발급받은 iOS Client ID
  // 실제 값은 환경별로 설정 필요
  IOS_CLIENT_ID: '203155895927-bj67eb4prrdip0lvqmr9mrgv05cvh4rc.apps.googleusercontent.com',
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

// 셀 범위 (실제 스프레드시트 검증 기준 2026-03-16)
export const CELL_RANGES = {
  // 설정 시트
  CATEGORIES: "'(필수)설정 시트'!D40:M51",
  PAYMENT_METHODS: "'(필수)설정 시트'!B11:C21",
  INCOME_CATEGORIES: "'(필수)설정 시트'!B25:B29",
  SAVINGS_PRODUCTS: "'(필수)설정 시트'!D4:N16",
  BANK_ACCOUNTS: "'(필수)설정 시트'!B18:B21",

  // 월별 시트 (동적: month 파라미터)
  EXPENSE_TRANSACTIONS: (month: string) => `'${month}'!F6:K1000`,
  INCOME_DETAILS: (month: string) => `'${month}'!B15:D19`,
  SAVINGS_DETAILS: (month: string) => `'${month}'!B22:D33`,
} as const;
