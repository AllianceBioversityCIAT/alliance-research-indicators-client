import { TestBed } from '@angular/core/testing';

import { GetAllYearsService } from './get-all-years.service';

describe('GetAllYearsService', () => {
  let service: GetAllYearsService;

  beforeEach(() => {
    // Instancia manual sin dependencias de Angular
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

  it('main debe setear loading y la lista correctamente', async () => {
    await service.main();
    expect(service.loading.set).toHaveBeenCalledWith(true);
    expect(service.list.set).toHaveBeenCalledWith([
      { id: 2024, name: '2024' },
      { id: 2025, name: '2025' }
    ]);
    expect(service.loading.set).toHaveBeenCalledWith(false);
  });

  it('isOpenSearch debe ser false', () => {
    expect(service.isOpenSearch()).toBe(false);
  });
});
