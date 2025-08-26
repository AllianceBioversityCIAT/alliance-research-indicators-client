// Mock for driver.js
export const driver = jest.fn(() => ({
  drive: jest.fn(),
  moveNext: jest.fn(),
  movePrevious: jest.fn(),
  hasNextStep: jest.fn().mockReturnValue(true),
  hasPreviousStep: jest.fn().mockReturnValue(false),
  isActive: jest.fn().mockReturnValue(false),
  getActiveIndex: jest.fn().mockReturnValue(0),
  isFirstStep: jest.fn().mockReturnValue(true),
  isLastStep: jest.fn().mockReturnValue(false),
  getActiveStep: jest.fn().mockReturnValue(null),
  getPreviousStep: jest.fn().mockReturnValue(null),
  getNextStep: jest.fn().mockReturnValue(null),
  destroy: jest.fn(),
  refresh: jest.fn(),
  highlight: jest.fn()
}));

export default driver;
