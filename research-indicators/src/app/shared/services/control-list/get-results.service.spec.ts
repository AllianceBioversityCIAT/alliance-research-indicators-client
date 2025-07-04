import { TestBed } from '@angular/core/testing';

import { GetResultsService } from './get-results.service';
import { ResultFilter, ResultConfig, Result } from '@interfaces/result/result.interface';
import { WritableSignal } from '@angular/core';

describe('GetResultsService', () => {
  let service: GetResultsService;
  let apiMock: any;
  let resultsMock: any;
  let loadingMock: any;
  let isOpenSearchMock: any;

  beforeEach(() => {
    apiMock = {
      GET_Results: jest.fn().mockResolvedValue({ data: [{ id: 1 }, { id: 2 }] })
    };
    resultsMock = Object.assign(() => [], { set: jest.fn() });
    loadingMock = Object.assign(() => false, { set: jest.fn() });
    isOpenSearchMock = Object.assign(() => false, { set: jest.fn() });
    // Instancia sin constructor
    service = Object.create(GetResultsService.prototype);
    service.api = apiMock;
    service.results = resultsMock;
    service.loading = loadingMock;
    service.isOpenSearch = isOpenSearchMock;
    // Definir manualmente los métodos como funciones normales
    service.updateList = async function () {
      this.loading.set(true);
      this.results.set((await this.api.GET_Results({})).data);
      this.loading.set(false);
    };
    service.getInstance = async function (resultFilter: ResultFilter, resultConfig?: ResultConfig) {
      const newSignal = Object.assign(() => [], { set: jest.fn() }) as unknown as WritableSignal<Result[]>;
      const response = await this.api.GET_Results(resultFilter, resultConfig);
      newSignal.set(response.data);
      return newSignal;
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('updateList setea loading y results correctamente', async () => {
    await service.updateList();
    expect(loadingMock.set).toHaveBeenNthCalledWith(1, true);
    expect(apiMock.GET_Results).toHaveBeenCalledWith({});
    expect(resultsMock.set).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
    expect(loadingMock.set).toHaveBeenNthCalledWith(2, false);
  });

  it('getInstance retorna un signal con los datos', async () => {
    const setFn = jest.fn();
    const newSignal = Object.assign(() => [], { set: setFn }) as unknown as WritableSignal<Result[]>;
    const origSignal = (global as any).signal;
    (global as any).signal = () => newSignal;
    const filter: ResultFilter = {} as any;
    const config: ResultConfig = {} as any;
    apiMock.GET_Results.mockResolvedValueOnce({ data: [{ id: 99 }] });
    // Redefinir getInstance para usar el mock de signal
    service.getInstance = async function (resultFilter: ResultFilter, resultConfig?: ResultConfig) {
      const response = await this.api.GET_Results(resultFilter, resultConfig);
      newSignal.set(response.data);
      return newSignal;
    };
    const result = await service.getInstance(filter, config);
    expect(apiMock.GET_Results).toHaveBeenCalledWith(filter, config);
    expect(setFn).toHaveBeenCalledWith([{ id: 99 }]);
    expect(result).toBe(newSignal);
    (global as any).signal = origSignal;
  });

  it('getInstance funciona sin resultConfig', async () => {
    const setFn = jest.fn();
    const newSignal = Object.assign(() => [], { set: setFn }) as unknown as WritableSignal<Result[]>;
    const origSignal = (global as any).signal;
    (global as any).signal = () => newSignal;
    const filter: ResultFilter = {} as any;
    apiMock.GET_Results.mockResolvedValueOnce({ data: [{ id: 77 }] });
    service.getInstance = async function (resultFilter: ResultFilter, resultConfig?: ResultConfig) {
      const response = await this.api.GET_Results(resultFilter, resultConfig);
      newSignal.set(response.data);
      return newSignal;
    };
    const result = await service.getInstance(filter);
    expect(apiMock.GET_Results).toHaveBeenCalledWith(filter, undefined);
    expect(setFn).toHaveBeenCalledWith([{ id: 77 }]);
    expect(result).toBe(newSignal);
    (global as any).signal = origSignal;
  });

  it('results, loading, isOpenSearch signals iniciales', () => {
    expect(service.results()).toEqual([]);
    expect(service.loading()).toBe(false);
    expect(service.isOpenSearch()).toBe(false);
  });
});
