import { Theme } from '../types/theme';

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    surfaceVariant: '#FAFAFA',
    text: '#333333',
    textSecondary: '#666666',
    textTertiary: '#999999',
    border: '#E0E0E0',
    borderLight: '#F0F0F0',
    divider: 'rgba(255, 255, 255, 0.2)',

    income: '#4CAF50',
    incomeLight: '#E8F5E9',
    incomeSoft: '#A5D6A7',
    expense: '#F44336',
    expenseLight: '#FFEBEE',
    expenseSoft: '#FFCDD2',
    warning: '#FF9800',
    primary: '#2196F3',
    primaryDark: '#1565C0',
    primaryLight: '#E3F2FD',

    cardBackground: '#FFFFFF',
    modalBackground: '#FFFFFF',
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#E0E0E0',

    todayBackground: '#2196F3',
    selectedDayBackground: '#BBDEFB',

    savingsBackground: '#E8F5E9',
    savingsText: '#2E7D32',
    savingsTitle: '#388E3C',

    chartColors: [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF8A80', '#7BC8A4', '#B39DDB', '#38E0DE',
    ],
  },
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textTertiary: '#777777',
    border: '#333333',
    borderLight: '#2A2A2A',
    divider: 'rgba(255, 255, 255, 0.1)',

    income: '#81C784',
    incomeLight: '#1B3A1B',
    incomeSoft: '#66BB6A',
    expense: '#E57373',
    expenseLight: '#3A1B1B',
    expenseSoft: '#EF9A9A',
    warning: '#FFB74D',
    primary: '#64B5F6',
    primaryDark: '#42A5F5',
    primaryLight: '#1A3A5C',

    cardBackground: '#1E1E1E',
    modalBackground: '#2C2C2C',
    modalOverlay: 'rgba(0, 0, 0, 0.7)',
    tabBarBackground: '#1E1E1E',
    tabBarBorder: '#333333',

    todayBackground: '#1565C0',
    selectedDayBackground: '#1A3A5C',

    savingsBackground: '#1B3A1B',
    savingsText: '#81C784',
    savingsTitle: '#66BB6A',

    chartColors: [
      '#FF7997', '#5BB8F5', '#FFD97A', '#6DD4D4', '#B08AFF',
      '#FFB566', '#FFA099', '#8FD9B5', '#C4B2E6', '#5EEAE8',
    ],
  },
};
