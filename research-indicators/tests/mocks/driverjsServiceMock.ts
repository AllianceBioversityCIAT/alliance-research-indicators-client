// Mock for DriverjsService
export const mockDriverjsService = {
  driverObj: {
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
  },
  tutorialMenuItems: [
    {
      label: 'How to Create Level 1 Structure',
      icon: 'pi pi-folder',
      command: jest.fn()
    },
    {
      label: 'How to Create Level 2 Structure',
      icon: 'pi pi-folder-open',
      disabled: true
    },
    {
      label: 'How to Create an Indicator',
      icon: 'pi pi-chart-line',
      disabled: true
    }
  ],
  showLevel1StructureTutorial: jest.fn(),
  nextStep: jest.fn(),
  setUpProjectService: {
    level1Name: jest.fn().mockReturnValue('Level 1'),
    level2Name: jest.fn().mockReturnValue('Level 2')
  }
};

export default mockDriverjsService;
