// Increase timeout for all tests
jest.setTimeout(30000);

// Silence console logs during tests unless there's an error
const originalConsoleLog = console.log;
console.log = (...args) => {
    if (args[0]?.includes('error') || args[0]?.includes('Error')) {
        originalConsoleLog(...args);
    }
}; 