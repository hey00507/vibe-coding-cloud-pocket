// @testing-library/react-native v12.4+ has built-in matchers
// No need to import extend-expect separately

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const createMockComponent = (name) => {
    const Component = ({ children, ...props }) =>
      React.createElement(name, props, children);
    Component.displayName = name;
    return Component;
  };
  const Svg = createMockComponent('Svg');
  return {
    __esModule: true,
    default: Svg,
    Svg,
    Circle: createMockComponent('Circle'),
    Rect: createMockComponent('Rect'),
    Path: createMockComponent('Path'),
    Text: createMockComponent('Text'),
    G: createMockComponent('G'),
    Line: createMockComponent('Line'),
    Defs: createMockComponent('Defs'),
    LinearGradient: createMockComponent('LinearGradient'),
    Stop: createMockComponent('Stop'),
    ClipPath: createMockComponent('ClipPath'),
  };
});

// Global test timeout
jest.setTimeout(10000);

// Silence specific warnings in tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return;
  }
  originalConsoleError.call(console, ...args);
};
