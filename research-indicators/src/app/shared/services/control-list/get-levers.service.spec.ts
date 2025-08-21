import { TestBed } from '@angular/core/testing';
import { GetLeversService } from './get-levers.service';
import { ApiService } from '../api.service';

describe('GetLeversService', () => {
  let service: GetLeversService;
  let apiMock: { GET_Levers: jest.Mock };

  const setup = async (response: any, reject = false) => {
    apiMock = {
      GET_Levers: reject ? jest.fn().mockRejectedValue(new Error('fail')) : jest.fn().mockResolvedValue(response)
    };
    TestBed.configureTestingModule({
      providers: [GetLeversService, { provide: ApiService, useValue: apiMock }]
    });
    service = TestBed.inject(GetLeversService);
    await Promise.resolve();
  };

  it('should be created', async () => {
    await setup({ data: [] });
    expect(service).toBeTruthy();
  });

  it('should initialize with empty list and loading false', async () => {
    await setup({ data: [] });
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
    expect(service.isOpenSearch()).toBe(false);
  });

  it('main success sets data and stops loading', async () => {
    const mockData = [
      { id: 1, name: 'Lever 1' },
      { id: 2, name: 'Lever 2' }
    ];
    await setup({ data: mockData });
    expect(apiMock.GET_Levers).toHaveBeenCalled();
    expect(service.list()).toEqual(mockData);
    expect(service.loading()).toBe(false);
  });

  it('main success handles non-array response', async () => {
    await setup({ data: null });
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('main catch sets empty list and stops loading', async () => {
    await setup(undefined, true);
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('should allow manual main call with updated data', async () => {
    await setup({ data: [] });
    const newData = [{ id: 3, name: 'New Lever' }];
    apiMock.GET_Levers.mockResolvedValueOnce({ data: newData });
    
    await service.main();
    expect(service.list()).toEqual(newData);
    expect(service.loading()).toBe(false);
  });
});
