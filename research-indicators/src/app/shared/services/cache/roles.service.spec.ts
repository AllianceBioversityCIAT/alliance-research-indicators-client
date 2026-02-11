import { TestBed } from '@angular/core/testing';
import { RolesService } from './roles.service';
import { CacheService } from './cache.service';
import { CreateResultManagementService } from '../../components/all-modals/modals-content/create-result-modal/services/create-result-management.service';

describe('RolesService', () => {
  let service: RolesService;

  let userRoles: Array<{ role_id: number }>;
  let editingOicr: boolean;
  let statusId: number | null;

  const mockCacheService: Partial<CacheService> = {
    dataCache: jest.fn((): any => ({
      user: { user_role_list: userRoles }
    })) as unknown as CacheService['dataCache']
  };

  const mockCreateResultManagementService: Partial<CreateResultManagementService> = {
    editingOicr: jest.fn(() => editingOicr) as unknown as CreateResultManagementService['editingOicr'],
    statusId: jest.fn(() => statusId) as unknown as CreateResultManagementService['statusId']
  };

  beforeEach(() => {
    userRoles = [];
    editingOicr = false;
    statusId = null;

    TestBed.configureTestingModule({
      providers: [
        RolesService,
        { provide: CacheService, useValue: mockCacheService },
        { provide: CreateResultManagementService, useValue: mockCreateResultManagementService }
      ]
    });

    service = TestBed.inject(RolesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isAdmin should be true when role_id 9 is present', () => {
    userRoles = [{ role_id: 2 }, { role_id: 9 }];
    expect(service.isAdmin()).toBe(true);
  });

  it('isAdmin should be false when role_id 9 is absent', () => {
    userRoles = [{ role_id: 2 }, { role_id: 3 }];
    expect(service.isAdmin()).toBe(false);
  });

  it('canEditOicr should be true when not editing (regardless of admin)', () => {
    // Not editing → always true
    editingOicr = false;
    userRoles = [{ role_id: 3 }];
    expect(service.canEditOicr()).toBe(true);

    userRoles = [{ role_id: 9 }];
    expect(service.canEditOicr()).toBe(true);
  });

  it('canEditOicr should be true when editing and user is admin', () => {
    editingOicr = true;
    statusId = 4; // Non-intermediate status
    userRoles = [{ role_id: 9 }];
    expect(service.canEditOicr()).toBe(true);
  });

  it('canEditOicr should be false when editing and user is not admin', () => {
    editingOicr = true;
    statusId = 4; // Non-intermediate status
    userRoles = [{ role_id: 2 }];
    expect(service.canEditOicr()).toBe(false);
  });

  it('canEditOicr should be true when editing, user is admin, and status is intermediate', () => {
    editingOicr = true;
    statusId = 10; // Intermediate status (Accepted)
    userRoles = [{ role_id: 9 }];
    expect(service.canEditOicr()).toBe(true);
  });

  it('canEditOicr should be false when editing, user is not admin, and status is intermediate', () => {
    editingOicr = true;
    statusId = 12; // Intermediate status (Science Edition)
    userRoles = [{ role_id: 2 }];
    expect(service.canEditOicr()).toBe(false);
  });
});
