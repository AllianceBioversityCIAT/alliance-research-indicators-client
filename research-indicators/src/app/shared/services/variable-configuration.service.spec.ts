import { TestBed } from '@angular/core/testing';
import { VariableConfigurationService } from './variable-configuration.service';
import { ApiService } from '@shared/services/api.service';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { RolesService } from '@shared/services/cache/roles.service';

describe('VariableConfigurationService', () => {
  let service: VariableConfigurationService;
  let api: {
    GET_AppConfigList: jest.Mock;
    GET_AppConfigCategories: jest.Mock;
    PATCH_AppConfigByKey: jest.Mock;
  };

  beforeEach(() => {
    api = {
      GET_AppConfigList: jest.fn().mockResolvedValue({
        data: { data: [{ key: 'test.key' }] }
      }),
      GET_AppConfigCategories: jest.fn().mockResolvedValue({ data: { categories: ['EMAIL'], subcategories: [] } }),
      PATCH_AppConfigByKey: jest.fn().mockResolvedValue({ data: { key: 'test.key' } })
    };
    TestBed.configureTestingModule({
      providers: [
        VariableConfigurationService,
        { provide: ApiService, useValue: api },
        {
          provide: AllModalsService,
          useValue: {
            openModal: jest.fn(),
            closeModal: jest.fn(),
            isModalOpen: jest.fn().mockReturnValue({ isOpen: false })
          }
        },
        {
          provide: RolesService,
          useValue: {
            canEditAppConfiguration: () => true
          }
        }
      ]
    });
    service = TestBed.inject(VariableConfigurationService);
  });

  it('loads list without sending pagination params', async () => {
    await service.loadList();
    expect(api.GET_AppConfigList).toHaveBeenCalledWith(
      expect.objectContaining({
        sortField: 'key',
        sortOrder: 'ASC'
      })
    );
    expect(api.GET_AppConfigList).toHaveBeenCalledWith(
      expect.not.objectContaining({
        page: expect.anything(),
        limit: expect.anything()
      })
    );
    expect(service.items()).toEqual([{ key: 'test.key' }]);
    expect(service.loading()).toBe(false);
  });

  it('extracts items from nested data.data response', async () => {
    api.GET_AppConfigList.mockResolvedValueOnce({
      data: {
        data: [{ key: 'nested.key' }],
        pagination: { total: 1, page: 1, limit: 1, pageSize: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
      }
    });
    await service.loadList();
    expect(service.items()).toEqual([{ key: 'nested.key' }]);
  });

  it('patches configuration and reloads list', async () => {
    const ok = await service.patchItem('test.key', { simple_value: 'x' });
    expect(ok).toBe(true);
    expect(api.PATCH_AppConfigByKey).toHaveBeenCalledWith('test.key', { simple_value: 'x' });
    expect(api.GET_AppConfigList).toHaveBeenCalled();
  });
});
