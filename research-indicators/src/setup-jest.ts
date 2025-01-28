import 'jest-preset-angular/setup-jest';

// Add polyfills for missing browser APIs
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setImmediatePolyfill = (handler: (...args: any[]) => void): NodeJS.Timeout => setTimeout(handler, 0);
setImmediatePolyfill.__promisify__ = () => Promise.resolve();
global.setImmediate = setImmediatePolyfill as unknown as typeof setImmediate;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.clearImmediate = ((id: any) => clearTimeout(id)) as typeof clearImmediate;

// Mock window.alert
// eslint-disable-next-line @typescript-eslint/no-empty-function
window.alert = () => {};

// Mock CSS @layer
Object.defineProperty(window, 'CSS', {
  value: {
    supports: () => true,
    escape: (str: string) => str,
    layer: () => true
  }
});
