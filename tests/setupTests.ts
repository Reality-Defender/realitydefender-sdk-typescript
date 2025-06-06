/**
 * Jest test setup file
 */

// Suppress Node.js unhandled promise rejection warnings
// eslint-disable-next-line @typescript-eslint/no-unused-vars
process.on('unhandledRejection', (reason, promise) => {
  // During tests we expect some unhandled rejections for testing error scenarios
  // console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Increase the timeout for async tests to avoid flakiness
jest.setTimeout(10000);

// Mock axios
jest.mock('axios', () => {
  // Define the mock axios type
  type MockAxiosType = {
    create: jest.MockedFunction<() => MockAxiosType>;
    get: jest.MockedFunction<any>;
    post: jest.MockedFunction<any>;
    put: jest.MockedFunction<any>;
    isAxiosError: jest.MockedFunction<any>;
  };

  const mockAxios: MockAxiosType = {
    create: jest.fn(() => mockAxios),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    isAxiosError: jest.fn(),
  };
  return mockAxios;
});

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));

// Create a client mock that tests can use when needed
export const mockClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
};

// DO NOT mock detection modules or client module - use the real implementations
// This allows our tests to target the actual code
jest.unmock('../src/detection/upload');
jest.unmock('../src/detection/results');

// Explicitly unmock the client module if it was mocked elsewhere
jest.unmock('../src/client');

// If you need to mock specific responses, do it in the individual test files
