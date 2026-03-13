import React from 'react';
import { render, act, waitFor, fireEvent } from '@testing-library/react-native';
import { Text, TouchableOpacity, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '../../src/controllers/ThemeContext';
import { useTheme } from '../../src/controllers/useTheme';
import { lightTheme, darkTheme } from '../../src/constants/theme';
import { STORAGE_KEYS } from '../../src/constants/storageKeys';

// useColorScheme mock
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(() => 'light'),
}));

const mockedUseColorScheme = useColorScheme as jest.MockedFunction<typeof useColorScheme>;

// 테스트용 Consumer 컴포넌트
function ThemeConsumer({ onPress }: { onPress?: (setThemeMode: (mode: 'light' | 'dark' | 'system') => void) => void }) {
  const { theme, themeMode, setThemeMode, isDark } = useTheme();
  return (
    <>
      <Text testID="mode">{theme.mode}</Text>
      <Text testID="themeMode">{themeMode}</Text>
      <Text testID="isDark">{String(isDark)}</Text>
      <Text testID="bgColor">{theme.colors.background}</Text>
      {onPress && (
        <TouchableOpacity testID="action" onPress={() => onPress(setThemeMode)} />
      )}
    </>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseColorScheme.mockReturnValue('light');
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('기본 테마 모드는 system', () => {
    const { getByTestId } = render(
      <ThemeProvider initialMode="system">
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(getByTestId('themeMode').props.children).toBe('system');
  });

  it('light 모드 설정 시 lightTheme 적용', () => {
    const { getByTestId } = render(
      <ThemeProvider initialMode="light">
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(getByTestId('mode').props.children).toBe('light');
    expect(getByTestId('bgColor').props.children).toBe(lightTheme.colors.background);
    expect(getByTestId('isDark').props.children).toBe('false');
  });

  it('dark 모드 설정 시 darkTheme 적용', () => {
    const { getByTestId } = render(
      <ThemeProvider initialMode="dark">
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(getByTestId('mode').props.children).toBe('dark');
    expect(getByTestId('bgColor').props.children).toBe(darkTheme.colors.background);
    expect(getByTestId('isDark').props.children).toBe('true');
  });

  it('setThemeMode로 light → dark 전환', async () => {
    const { getByTestId } = render(
      <ThemeProvider initialMode="light">
        <ThemeConsumer onPress={(setThemeMode) => setThemeMode('dark')} />
      </ThemeProvider>,
    );

    expect(getByTestId('mode').props.children).toBe('light');

    await act(async () => {
      fireEvent.press(getByTestId('action'));
    });

    expect(getByTestId('mode').props.children).toBe('dark');
    expect(getByTestId('bgColor').props.children).toBe(darkTheme.colors.background);
  });

  it('setThemeMode 호출 시 AsyncStorage에 저장', async () => {
    const { getByTestId } = render(
      <ThemeProvider initialMode="light">
        <ThemeConsumer onPress={(setThemeMode) => setThemeMode('dark')} />
      </ThemeProvider>,
    );

    await act(async () => {
      fireEvent.press(getByTestId('action'));
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.THEME_MODE,
      'dark',
    );
  });

  it('앱 시작 시 AsyncStorage에서 저장된 테마 로드', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('dark');

    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('mode').props.children).toBe('dark');
    });
  });

  it('system 모드에서 시스템이 dark일 때 darkTheme 적용', () => {
    mockedUseColorScheme.mockReturnValue('dark');

    const { getByTestId } = render(
      <ThemeProvider initialMode="system">
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(getByTestId('mode').props.children).toBe('dark');
    expect(getByTestId('isDark').props.children).toBe('true');
  });

  it('system 모드에서 시스템이 light일 때 lightTheme 적용', () => {
    mockedUseColorScheme.mockReturnValue('light');

    const { getByTestId } = render(
      <ThemeProvider initialMode="system">
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(getByTestId('mode').props.children).toBe('light');
    expect(getByTestId('isDark').props.children).toBe('false');
  });

  it('isDark 플래그가 정확함 — dark일 때 true', () => {
    const { getByTestId } = render(
      <ThemeProvider initialMode="dark">
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(getByTestId('isDark').props.children).toBe('true');
  });

  it('isDark 플래그가 정확함 — light일 때 false', () => {
    const { getByTestId } = render(
      <ThemeProvider initialMode="light">
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(getByTestId('isDark').props.children).toBe('false');
  });

  it('ThemeProvider 없이 useTheme 호출 시 에러', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<ThemeConsumer />);
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleError.mockRestore();
  });
});
