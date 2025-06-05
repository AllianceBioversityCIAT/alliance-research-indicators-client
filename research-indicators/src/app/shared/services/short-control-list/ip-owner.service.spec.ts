import { TestBed } from '@angular/core/testing';
import { IpOwnerService } from './ip-owner.service';
import { ApiService } from '../api.service';

describe('IpOwnerService', () => {
  let service: IpOwnerService;
  let apiMock: Partial<ApiService>;

  beforeEach(() => {
    apiMock = {
      GET_IpOwners: jest.fn().mockResolvedValue({
        data: [
          { id: 1, name: 'Owner 1' },
          { id: 2, name: 'Owner 2' }
        ]
      })
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: ApiService, useValue: apiMock }
      ]
    });
  });

  it('should be created', () => {
    service = TestBed.inject(IpOwnerService);
    expect(service).toBeTruthy();
  });

  it('should load ip owners data on initialization', async () => {
    service = TestBed.inject(IpOwnerService);
    // Esperamos a que se complete la inicialización
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(service.list()).toEqual([
      { id: 1, name: 'Owner 1' },
      { id: 2, name: 'Owner 2' }
    ]);
    expect(service.loading()).toBeFalsy();
  });

  it('should handle loading state correctly', async () => {
    service = TestBed.inject(IpOwnerService);
    const mainPromise = service.main();
    expect(service.loading()).toBeTruthy();
    await mainPromise;
    expect(service.loading()).toBeFalsy();
  });

  it('should handle API errors gracefully', async () => {
    apiMock.GET_IpOwners = jest.fn().mockRejectedValue(new Error('API Error'));
    service = TestBed.inject(IpOwnerService);
    // Ejecutamos main manualmente para simular el error
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBeFalsy();
  });
});
