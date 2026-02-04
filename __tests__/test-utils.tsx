import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';

// 커스텀 Provider 래퍼 (필요 시 ThemeProvider 등 추가)
interface WrapperProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: WrapperProps) => {
  // 추후 ThemeProvider, NavigationContainer 등 래핑
  return <>{children}</>;
};

// 커스텀 렌더 함수
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react-native';

// override render method
export { customRender as render };
