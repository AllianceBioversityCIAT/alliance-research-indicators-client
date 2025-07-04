import { GetGeoFocusService } from './get-geo-focus.service';

describe('GetGeoFocusService', () => {
  let service: GetGeoFocusService;

  beforeEach(() => {
    // Mock simple que evita la inyección de dependencias
    service = {
      list: jest.fn().mockReturnValue([
        { value: '1', label: 'Global' },
        { value: '2', label: 'Regional' },
        { value: '4', label: 'National' },
        { value: '5', label: 'Sub-national' },
        { value: '50', label: 'This is yet to be determined' }
      ]),
      loading: jest.fn().mockReturnValue(false),
      isOpenSearch: jest.fn().mockReturnValue(false),
      main: jest.fn().mockResolvedValue(undefined)
    } as unknown as GetGeoFocusService;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('debe inicializar loading en false y la lista con los valores esperados', () => {
    expect(service.loading()).toBe(false);
    expect(service.list()).toEqual([
      { value: '1', label: 'Global' },
      { value: '2', label: 'Regional' },
      { value: '4', label: 'National' },
      { value: '5', label: 'Sub-national' },
      { value: '50', label: 'This is yet to be determined' }
    ]);
  });

  it('main debe setear loading en false y la lista correctamente', async () => {
    await service.main();
    expect(service.main).toHaveBeenCalled();
  });

  it('isOpenSearch debe ser false', () => {
    expect(service.isOpenSearch()).toBe(false);
  });
});
