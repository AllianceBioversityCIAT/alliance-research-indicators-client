import { TestBed } from '@angular/core/testing';

import { GetMetadataService } from './get-metadata.service';

describe('GetMetadataService', () => {
  let service: GetMetadataService;
  let apiMock: any;
  let cacheMock: any;
  let routerMock: any;

  beforeEach(() => {
    apiMock = {
      GET_Metadata: jest.fn()
    };
    cacheMock = {
      currentMetadata: { set: jest.fn() },
      currentResultId: { set: jest.fn() }
    };
    routerMock = { navigate: jest.fn() };
    service = Object.create(GetMetadataService.prototype);
    service.api = apiMock;
    service.cache = cacheMock;
    service.router = routerMock;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('update returns true and sets metadata if status is 200', async () => {
    apiMock.GET_Metadata.mockResolvedValue({ status: 200, data: { foo: 'bar' } });
    const result = await service.update(1);
    expect(apiMock.GET_Metadata).toHaveBeenCalledWith(1, undefined);
    expect(cacheMock.currentMetadata.set).toHaveBeenCalledWith({ foo: 'bar' });
    expect(result).toBe(true);
  });

  it('update returns false and navigates if status is not 200', async () => {
    apiMock.GET_Metadata.mockResolvedValue({ status: 404 });
    const result = await service.update(2);
    expect(apiMock.GET_Metadata).toHaveBeenCalledWith(2, undefined);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/results-center']);
    expect(result).toBe(false);
  });

  it('update returns false and navigates if response is undefined', async () => {
    apiMock.GET_Metadata.mockResolvedValue(undefined);
    const result = await service.update(3);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/results-center']);
    expect(result).toBe(false);
  });

  it('formatText returns formatted string correctly', () => {
    expect(service.formatText('Hello World')).toBe('HelWor');
    expect(service.formatText('Angular Test')).toBe('AngTes');
    expect(service.formatText('A B')).toBe('AB');
    expect(service.formatText('OneWord')).toBe('');
    expect(service.formatText('  ')).toBe('');
    expect(service.formatText('foo bar baz')).toBe('FooBaz');
  });

  it('clearMetadata should reset metadata and resultId', () => {
    service.clearMetadata();
    expect(cacheMock.currentMetadata.set).toHaveBeenCalledWith({});
    expect(cacheMock.currentResultId.set).toHaveBeenCalledWith(0);
  });

  it('clearMetadata should not throw if signals are undefined', () => {
    service.cache.currentMetadata = undefined as any;
    service.cache.currentResultId = undefined as any;
    expect(() => service.clearMetadata()).not.toThrow();
  });
});
