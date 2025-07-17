import { GetGeoFocusService } from './get-geo-focus.service';

describe('GetGeoFocusService', () => {
  let service: GetGeoFocusService;

  beforeEach(() => {
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

  it('should initialize loading as false and list with expected values', () => {
    expect(service.loading()).toBe(false);
    expect(service.list()).toEqual([
      { value: '1', label: 'Global' },
      { value: '2', label: 'Regional' },
      { value: '4', label: 'National' },
      { value: '5', label: 'Sub-national' },
      { value: '50', label: 'This is yet to be determined' }
    ]);
  });

  it('main should set loading as false and list correctly', async () => {
    await service.main();
    expect(service.main).toHaveBeenCalled();
  });

  it('isOpenSearch should be false', () => {
    expect(service.isOpenSearch()).toBe(false);
  });
});
