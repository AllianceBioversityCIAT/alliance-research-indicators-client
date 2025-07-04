import { TestBed } from '@angular/core/testing';

import { PolicyStagesService } from './policy-stages.service';

describe('PolicyStagesService', () => {
  let service: PolicyStagesService;
  let listMock: any;
  let loadingMock: any;

  beforeEach(() => {
    listMock = Object.assign(() => [], { set: jest.fn() });
    loadingMock = Object.assign(() => false, { set: jest.fn() });
    service = Object.create(PolicyStagesService.prototype);
    service.list = listMock;
    service.loading = loadingMock;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('main debe setear loading y list correctamente', async () => {
    await service.main();
    expect(loadingMock.set).toHaveBeenCalledWith(true);
    expect(listMock.set).toHaveBeenCalledWith([
      { id: 1, name: 'Stage 1: Research taken up by next user, policy change not yet enacted' },
      { id: 2, name: 'Stage 2: Policy enacted' },
      { id: 3, name: 'Stage 3: Evidence of impact of policy' }
    ]);
    expect(loadingMock.set).toHaveBeenCalledWith(false);
  });

  it('main debe dejar loading en false aunque falle el set de list', async () => {
    listMock.set = jest.fn(() => {
      throw new Error('fail');
    });
    await expect(service.main()).rejects.toThrow('fail');
    // loading.set(false) debe llamarse aunque falle list.set
    expect(loadingMock.set).toHaveBeenCalledWith(false);
  });
});
