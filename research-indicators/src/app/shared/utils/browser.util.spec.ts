import { getBrowserInfo, BrowserInfo } from './browser.util';

describe('browser.util', () => {
  let originalUserAgent: string;

  beforeEach(() => {
    originalUserAgent = navigator.userAgent;
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true
    });
  });

  describe('getBrowserInfo', () => {
    it('debe detectar Opera correctamente', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.254',
        configurable: true
      });

      const result = getBrowserInfo();
      expect(result.name).toBe('Opera');
      expect(result.fullVersion).toBe('77.0.4054.254');
      expect(result.majorVersion).toBe(77);
    });

    it('debe detectar Opera con Version en userAgent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.254 Version/77.0.4054.254',
        configurable: true
      });

      const result = getBrowserInfo();
      expect(result.name).toBe('Opera');
      expect(result.fullVersion).toBe('77.0.4054.254');
      expect(result.majorVersion).toBe(77);
    });

    it('debe detectar Microsoft Edge correctamente', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
        configurable: true
      });

      const result = getBrowserInfo();
      expect(result.name).toBe('Microsoft Edge');
      expect(result.fullVersion).toBe('91.0.864.59');
      expect(result.majorVersion).toBe(91);
    });

    it('debe detectar Internet Explorer correctamente', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko MSIE 11.0',
        configurable: true
      });

      const result = getBrowserInfo();
      expect(result.name).toBe('Microsoft Internet Explorer');
      expect(result.fullVersion).toBe('11.0');
      expect(result.majorVersion).toBe(11);
    });

    it('debe detectar Chrome correctamente', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        configurable: true
      });

      const result = getBrowserInfo();
      expect(result.name).toBe('Chrome');
      expect(result.fullVersion).toBe('91.0.4472.124');
      expect(result.majorVersion).toBe(91);
    });

    it('debe detectar Safari correctamente', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        configurable: true
      });

      const result = getBrowserInfo();
      expect(result.name).toBe('Safari');
      expect(result.fullVersion).toBe('14.1.1');
      expect(result.majorVersion).toBe(14);
    });

    it('debe detectar Safari con Version en userAgent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        configurable: true
      });

      const result = getBrowserInfo();
      expect(result.name).toBe('Safari');
      expect(result.fullVersion).toBe('14.1.1');
      expect(result.majorVersion).toBe(14);
    });

    it('debe detectar Firefox correctamente', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        configurable: true
      });

      const result = getBrowserInfo();
      expect(result.name).toBe('Firefox');
      expect(result.fullVersion).toBe('89.0');
      expect(result.majorVersion).toBe(89);
    });

    it('debe detectar navegador genérico con formato name/version', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'CustomBrowser/1.2.3',
        configurable: true
      });

      const result = getBrowserInfo();
      expect(result.name).toBe('CustomBrowser');
      expect(result.fullVersion).toBe('1.2.3');
      expect(result.majorVersion).toBe(1);
    });

    it('debe manejar navegador genérico con nombre en mayúsculas (debe ser Unknown)', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'ABCDEF/1.2.3',
        configurable: true
      });

      const result = getBrowserInfo();
      expect(result.name).toBe('ABCDEF');
      expect(result.fullVersion).toBe('1.2.3');
      expect(result.majorVersion).toBe(1);
    });

    it('debe manejar versión con punto y coma', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124; Safari/537.36',
        configurable: true
      });

      const result = getBrowserInfo();
      expect(result.name).toBe('Chrome');
      expect(result.fullVersion).toBe('91.0.4472.124');
      expect(result.majorVersion).toBe(91);
    });

    it('debe manejar versión con espacio', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        configurable: true
      });

      const result = getBrowserInfo();
      expect(result.name).toBe('Chrome');
      expect(result.fullVersion).toBe('91.0.4472.124');
      expect(result.majorVersion).toBe(91);
    });

    it('debe manejar versión inválida (NaN)', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/invalid Safari/537.36',
        configurable: true
      });

      const result = getBrowserInfo();
      expect(result.name).toBe('Chrome');
      expect(result.fullVersion).toBe('Mozilla/5.0');
      expect(result.majorVersion).toBe(0);
    });

    it('debe manejar userAgent completamente desconocido', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'UnknownBrowser',
        configurable: true
      });

      const result = getBrowserInfo();
      expect(result.name).toBe('Unknown');
      expect(result.fullVersion).toBe('UnknownBrowser');
      expect(result.majorVersion).toBe(0);
    });

    it('debe manejar userAgent vacío', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: '',
        configurable: true
      });

      const result = getBrowserInfo();
      expect(result.name).toBe('Unknown');
      expect(result.fullVersion).toBe('');
      expect(result.majorVersion).toBe(0);
    });

    it('debe manejar versión con múltiples espacios', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124   Safari/537.36',
        configurable: true
      });

      const result = getBrowserInfo();
      expect(result.name).toBe('Chrome');
      expect(result.fullVersion).toBe('91.0.4472.124');
      expect(result.majorVersion).toBe(91);
    });

    it('debe manejar versión con múltiples puntos y coma', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124;; Safari/537.36',
        configurable: true
      });

      const result = getBrowserInfo();
      expect(result.name).toBe('Chrome');
      expect(result.fullVersion).toBe('91.0.4472.124');
      expect(result.majorVersion).toBe(91);
    });

    it('debe manejar caso donde no hay navegador conocido', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'SomeRandomString',
        configurable: true
      });

      const result = getBrowserInfo();
      expect(result.name).toBe('Unknown');
      expect(result.fullVersion).toBe('SomeRandomString');
      expect(result.majorVersion).toBe(0);
    });

    it('debe manejar caso donde el formato name/version no se encuentra', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'NoSlashHere',
        configurable: true
      });

      const result = getBrowserInfo();
      expect(result.name).toBe('Unknown');
      expect(result.fullVersion).toBe('NoSlashHere');
      expect(result.majorVersion).toBe(0);
    });

    it('debe manejar caso donde el formato name/version no se encuentra (sin slash)', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'NoSlashHere',
        configurable: true
      });

      const result = getBrowserInfo();
      expect(result.name).toBe('Unknown');
      expect(result.fullVersion).toBe('NoSlashHere');
      expect(result.majorVersion).toBe(0);
    });

    it('debe manejar caso donde el formato name/version no se encuentra (condición no cumplida)', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Test Test',
        configurable: true
      });

      const result = getBrowserInfo();
      expect(result.name).toBe('Unknown');
      expect(result.fullVersion).toBe('Test');
      expect(result.majorVersion).toBe(0);
    });

    it('debe manejar navegador con nombre solo numérico como Unknown', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: '12345/6.7.8',
        configurable: true
      });
      const result = getBrowserInfo();
      expect(result.name).toBe('Unknown');
      expect(result.fullVersion).toBe('6.7.8');
      expect(result.majorVersion).toBe(6);
    });
  });
});
