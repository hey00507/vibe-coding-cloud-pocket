// @testing-library/react-native v12.4+ has built-in matchers
// No need to import extend-expect separately

// Mock AsyncStorage (will be activated when package is installed)
// jest.mock('@react-native-async-storage/async-storage', () =>
//   require('@react-native-async-storage/async-storage/jest/async-storage-mock')
// );

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
