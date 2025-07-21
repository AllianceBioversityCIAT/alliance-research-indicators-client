import { TestBed } from '@angular/core/testing';

import { GetAllYearsService } from './get-all-years.service';

describe('GetAllYearsService', () => {
  let service: GetAllYearsService;

  beforeEach(() => {
    service = Object.create(GetAllYearsService.prototype);
    service.list = (() => [
      { id: 2024, name: '2024' },
      { id: 2025, name: '2025' }
    ]) as any;
    service.list.set = jest.fn();
    service.loading = jest.fn(() => false) as any;
    service.loading.set = jest.fn();
    service.isOpenSearch = jest.fn(() => false) as any;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('main should set loading and list correctly', async () => {
    await service.main();
    expect(service.loading.set).toHaveBeenCalledWith(true);
    expect(service.list.set).toHaveBeenCalledWith([
      { id: 2024, name: '2024' },
      { id: 2025, name: '2025' }
    ]);
    expect(service.loading.set).toHaveBeenCalledWith(false);
  });

  it('isOpenSearch should be false', () => {
    expect(service.isOpenSearch()).toBe(false);
  });
});
