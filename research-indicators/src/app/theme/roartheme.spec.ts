jest.mock('@primeng/themes/aura', () => ({}), { virtual: true });
jest.mock('@primeng/themes', () => ({ definePreset: jest.fn((a, b) => ({ preset: b })) }), { virtual: true });

// Importación después de los mocks
import { MyPreset, appConfig } from './roartheme';

describe('roartheme', () => {
  it('debe exportar MyPreset', () => {
    expect(MyPreset).toBeDefined();
  });

  it('debe exportar appConfig', () => {
    expect(appConfig).toBeDefined();
    expect(appConfig.providers).toBeInstanceOf(Array);
  });
});
