import { Theme } from '../types/theme';

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: '#F8F9FC',
    surface: '#FFFFFF',
    surfaceVariant: '#EEF1F8',
    text: '#1B2A4A',
    textSecondary: '#5A6B8A',
    textTertiary: '#8E9BB5',
    border: '#D8DEE9',
    borderLight: '#E8ECF4',
    divider: 'rgba(27, 42, 74, 0.08)',

    income: '#2E9E5A',
    incomeLight: '#E6F7ED',
    incomeSoft: '#7BC89A',
    expense: '#D94452',
    expenseLight: '#FDE8EB',
    expenseSoft: '#F0A0A8',
    warning: '#E8963F',
    primary: '#2B4C7E',
    primaryDark: '#1B2A4A',
    primaryLight: '#E8EDF5',

    cardBackground: '#FFFFFF',
    modalBackground: '#FFFFFF',
    modalOverlay: 'rgba(13, 27, 42, 0.5)',
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#D8DEE9',

    todayBackground: '#2B4C7E',
    selectedDayBackground: '#D6E0F0',

    savingsBackground: '#E6F7ED',
    savingsText: '#1A7A3E',
    savingsTitle: '#2E9E5A',

    chartColors: [
      '#2B4C7E', '#D94452', '#2E9E5A', '#E8963F', '#7B68AE',
      '#3A8FBF', '#C75B8E', '#5BA88C', '#B8884D', '#6B8EB5',
    ],
  },
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: '#0D1B2A',
    surface: '#152238',
    surfaceVariant: '#1B2D47',
    text: '#E0E6EF',
    textSecondary: '#8A9BB5',
    textTertiary: '#5A6B82',
    border: '#243B56',
    borderLight: '#1B2D47',
    divider: 'rgba(224, 230, 239, 0.08)',

    income: '#5FBF80',
    incomeLight: '#132A1E',
    incomeSoft: '#7BC89A',
    expense: '#E87070',
    expenseLight: '#2E1515',
    expenseSoft: '#F0A0A8',
    warning: '#F0AD5E',
    primary: '#5B8EC9',
    primaryDark: '#7BAAD6',
    primaryLight: '#1B3050',

    cardBackground: '#152238',
    modalBackground: '#1B2D47',
    modalOverlay: 'rgba(0, 0, 0, 0.7)',
    tabBarBackground: '#0D1B2A',
    tabBarBorder: '#243B56',

    todayBackground: '#2B4C7E',
    selectedDayBackground: '#1B3050',

    savingsBackground: '#132A1E',
    savingsText: '#5FBF80',
    savingsTitle: '#7BC89A',

    chartColors: [
      '#5B8EC9', '#E87070', '#5FBF80', '#F0AD5E', '#9B85C9',
      '#5AAFE0', '#D97BA0', '#70C9A5', '#D4A060', '#85A8CC',
    ],
  },
};
