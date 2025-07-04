import { GetContractsService } from './get-contracts.service';
import { apiServiceMock } from '../../../testing/mock-services.mock';

function createService(apiMock: any) {
  // @ts-ignore
  const service = Object.create(GetContractsService.prototype);
  service.api = apiMock;
  service.list = jest.fn(() => []).mockReturnValue([]);
  service.list.set = jest.fn();
  service.list.update = jest.fn(fn => fn([]));
  service.loading = jest.fn(() => false).mockReturnValue(false);
  service.loading.set = jest.fn();
  service.isOpenSearch = jest.fn(() => false).mockReturnValue(false);
  return service as unknown as GetContractsService;
}

describe('GetContractsService', () => {
  const mockData = [
    { agreement_id: 'A1', description: 'Contract 1' },
    { agreement_id: 'A2', description: 'Contract 2' }
  ];

  it('should be created', () => {
    const service = createService(apiServiceMock);
    expect(service).toBeTruthy();
  });

  it('should load contracts successfully', async () => {
    const apiMock = { ...apiServiceMock, GET_Contracts: jest.fn().mockResolvedValue({ data: mockData }) };
    const service = createService(apiMock);
    await service.main();
    expect(service.list.set).toHaveBeenCalledWith(mockData);
    expect(service.list.update).toHaveBeenCalled();
    expect(service.loading.set).toHaveBeenLastCalledWith(false);
  });

  it('should handle response with no data', async () => {
    const apiMock = { ...apiServiceMock, GET_Contracts: jest.fn().mockResolvedValue({ data: null }) };
    const service = createService(apiMock);
    await service.main();
    expect(service.list.set).toHaveBeenCalledWith([]);
    expect(service.loading.set).toHaveBeenLastCalledWith(false);
  });

  it('should handle undefined response', async () => {
    const apiMock = { ...apiServiceMock, GET_Contracts: jest.fn().mockResolvedValue(undefined) };
    const service = createService(apiMock);
    await service.main();
    expect(service.list.set).toHaveBeenCalledWith([]);
    expect(service.loading.set).toHaveBeenLastCalledWith(false);
  });

  it('should handle API errors', async () => {
    const apiMock = { ...apiServiceMock, GET_Contracts: jest.fn().mockRejectedValue(new Error('API Error')) };
    const service = createService(apiMock);
    await service.main();
    expect(service.list.set).toHaveBeenCalledWith([]);
    expect(service.loading.set).toHaveBeenLastCalledWith(false);
  });

  it('should execute initialize correctly', () => {
    const service = createService(apiServiceMock);
    const mainSpy = jest.spyOn(service, 'main').mockImplementation();
    service.initialize();
    expect(mainSpy).toHaveBeenCalled();
  });
});
