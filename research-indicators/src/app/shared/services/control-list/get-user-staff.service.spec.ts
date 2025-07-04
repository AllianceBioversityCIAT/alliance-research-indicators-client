import { TestBed } from '@angular/core/testing';

import { GetUserStaffService } from './get-user-staff.service';

describe('GetUserStaffService', () => {
  let service: GetUserStaffService;
  let apiMock: any;
  let listMock: any;
  let loadingMock: any;

  const mockData = [
    { carnet: '123', first_name: 'John', last_name: 'Doe', email: 'john@doe.com' },
    { carnet: '456', first_name: 'Jane', last_name: 'Smith', email: 'jane@smith.com' }
  ];

  beforeEach(() => {
    apiMock = {
      GET_UserStaff: jest.fn().mockResolvedValue({ data: JSON.parse(JSON.stringify(mockData)) })
    };
    listMock = Object.assign(() => [], { set: jest.fn() });
    loadingMock = Object.assign(() => false, { set: jest.fn() });
    service = Object.create(GetUserStaffService.prototype);
    service.api = apiMock;
    service.list = listMock;
    service.loading = loadingMock;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('main should set loading, transform data and set list correctly', async () => {
    await service.main();
    expect(loadingMock.set).toHaveBeenCalledWith(true);
    expect(apiMock.GET_UserStaff).toHaveBeenCalled();
    expect(listMock.set).toHaveBeenCalledWith([
      {
        carnet: '123',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@doe.com',
        full_name: 'Doe, John  - john@doe.com',
        user_id: '123'
      },
      {
        carnet: '456',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@smith.com',
        full_name: 'Smith, Jane  - jane@smith.com',
        user_id: '456'
      }
    ]);
    expect(loadingMock.set).toHaveBeenCalledWith(false);
  });

  it('main should handle errors correctly', async () => {
    apiMock.GET_UserStaff = jest.fn().mockRejectedValue(new Error('fail'));
    try {
      await service.main();
    } catch (error) {
      // The error is propagated, but loading.set(false) should have been called
    }
    expect(loadingMock.set).toHaveBeenCalledWith(true);
    expect(loadingMock.set).toHaveBeenCalledWith(false);
  });
});
