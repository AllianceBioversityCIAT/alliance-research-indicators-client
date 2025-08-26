// Mock for echarts
export const init = jest.fn(() => ({
  setOption: jest.fn(),
  resize: jest.fn(),
  dispose: jest.fn(),
  getWidth: jest.fn().mockReturnValue(400),
  getHeight: jest.fn().mockReturnValue(300),
  getDom: jest.fn().mockReturnValue(document.createElement('div')),
  getOption: jest.fn().mockReturnValue({}),
  clear: jest.fn(),
  isDisposed: jest.fn().mockReturnValue(false),
  on: jest.fn(),
  off: jest.fn(),
  dispatchAction: jest.fn(),
  showLoading: jest.fn(),
  hideLoading: jest.fn()
}));

export const use = jest.fn();
export const registerTheme = jest.fn();
export const graphic = {
  LinearGradient: jest.fn(),
  RadialGradient: jest.fn()
};

// Chart types
export class BarChart {
  static type = 'bar';
}

export class LineChart {
  static type = 'line';
}

export class PieChart {
  static type = 'pie';
}

// Components
export class TitleComponent {
  static type = 'title';
}

export class TooltipComponent {
  static type = 'tooltip';
}

export class GridComponent {
  static type = 'grid';
}

export class LegendComponent {
  static type = 'legend';
}

export class DatasetComponent {
  static type = 'dataset';
}

export class DataZoomComponent {
  static type = 'dataZoom';
}

// Features
export class LabelLayout {
  static type = 'labelLayout';
}

export class UniversalTransition {
  static type = 'universalTransition';
}

// Renderers
export class CanvasRenderer {
  static type = 'canvas';
}

export class SVGRenderer {
  static type = 'svg';
}

export default {
  init,
  use,
  registerTheme,
  graphic,
  BarChart,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent,
  DataZoomComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
  SVGRenderer
};
