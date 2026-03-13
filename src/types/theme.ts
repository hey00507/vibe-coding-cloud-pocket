export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // 기본
  background: string;
  surface: string;
  surfaceVariant: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderLight: string;
  divider: string;

  // 시맨틱
  income: string;
  incomeLight: string;
  incomeSoft: string;
  expense: string;
  expenseLight: string;
  expenseSoft: string;
  warning: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;

  // 컴포넌트
  cardBackground: string;
  modalBackground: string;
  modalOverlay: string;
  tabBarBackground: string;
  tabBarBorder: string;

  // 캘린더
  todayBackground: string;
  selectedDayBackground: string;

  // 저축/자산
  savingsBackground: string;
  savingsText: string;
  savingsTitle: string;

  // 차트
  chartColors: string[];
}

export interface Theme {
  mode: 'light' | 'dark';
  colors: ThemeColors;
}
