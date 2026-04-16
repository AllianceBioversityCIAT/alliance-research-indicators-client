import { TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { RolesService } from './roles.service';
import { CacheService } from './cache.service';
import { CreateResultManagementService } from '../../components/all-modals/modals-content/create-result-modal/services/create-result-management.service';

type TestUserRole = { role_id: number; role?: { focus_id?: number; sec_role_id?: number | null } };

describe('RolesService', () => {
  let service: RolesService;

  const userRoleList = signal<TestUserRole[]>([]);
  const mockDataCache = computed(() => ({
    user: { user_role_list: userRoleList() }
  }));

  let editingOicr: boolean;
  let statusId: number | null;

  const mockCacheService: Partial<CacheService> = {
    dataCache: mockDataCache as unknown as CacheService['dataCache']
  };

  const mockCreateResultManagementService: Partial<CreateResultManagementService> = {
    editingOicr: jest.fn(() => editingOicr) as unknown as CreateResultManagementService['editingOicr'],
    statusId: jest.fn(() => statusId) as unknown as CreateResultManagementService['statusId']
  };

  beforeEach(() => {
    userRoleList.set([]);
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
    userRoleList.set([{ role_id: 2 }, { role_id: 9 }]);
    expect(service.isAdmin()).toBe(true);
  });

  it('isAdmin should be true when role_id 1 is present', () => {
    userRoleList.set([{ role_id: 5 }, { role_id: 1 }]);
    expect(service.isAdmin()).toBe(true);
  });

  it('isAdmin should be false when role_id 9 is absent', () => {
    userRoleList.set([{ role_id: 2 }, { role_id: 3 }]);
    expect(service.isAdmin()).toBe(false);
  });

  it('canAccessCenterAdmin should be true for super admin (1) or general/center admin (9/10) with focus and sec_role_id', () => {
    userRoleList.set([{ role_id: 1 }]);
    expect(service.canAccessCenterAdmin()).toBe(true);
    userRoleList.set([{ role_id: 9, role: { focus_id: 1, sec_role_id: 9 } }]);
    expect(service.canAccessCenterAdmin()).toBe(true);
    userRoleList.set([{ role_id: 10, role: { focus_id: 1, sec_role_id: 10 } }]);
    expect(service.canAccessCenterAdmin()).toBe(true);
  });

  it('canAccessCenterAdmin should be false without super admin or matching focus_id and sec_role_id', () => {
    userRoleList.set([{ role_id: 2 }, { role_id: 8 }]);
    expect(service.canAccessCenterAdmin()).toBe(false);
    userRoleList.set([{ role_id: 9, role: { focus_id: 2, sec_role_id: 9 } }]);
    expect(service.canAccessCenterAdmin()).toBe(false);
    userRoleList.set([{ role_id: 9, role: { focus_id: 1, sec_role_id: 8 } }]);
    expect(service.canAccessCenterAdmin()).toBe(false);
    userRoleList.set([{ role_id: 9 }]);
    expect(service.canAccessCenterAdmin()).toBe(false);
  });

  it('canAccessCenterAdmin should be false when focus matches but sec_role_id is missing', () => {
    userRoleList.set([{ role_id: 9, role: { focus_id: 1 } }]);
    expect(service.canAccessCenterAdmin()).toBe(false);
  });

  it('canAccessCenterAdmin should evaluate non-super-admin entries when first entry is not a match', () => {
    userRoleList.set([{ role_id: 2 }, { role_id: 9, role: { focus_id: 1, sec_role_id: 9 } }]);
    expect(service.canAccessCenterAdmin()).toBe(true);
  });

  it('canEditOicr should be true when not editing (regardless of admin)', () => {
    editingOicr = false;
    userRoleList.set([{ role_id: 3 }]);
    expect(service.canEditOicr()).toBe(true);

    userRoleList.set([{ role_id: 9 }]);
    expect(service.canEditOicr()).toBe(true);
  });

  it('canEditOicr should be true when editing and user is admin', () => {
    editingOicr = true;
    statusId = 4;
    userRoleList.set([{ role_id: 9 }]);
    expect(service.canEditOicr()).toBe(true);
  });

  it('canEditOicr should be false when editing and user is not admin', () => {
    editingOicr = true;
    statusId = 4;
    userRoleList.set([{ role_id: 2 }]);
    expect(service.canEditOicr()).toBe(false);
  });

  it.each([10, 12, 13, 14] as const)(
    'canEditOicr should be true when editing, user is admin, and status is intermediate (%s)',
    intermediateStatusId => {
      editingOicr = true;
      statusId = intermediateStatusId;
      userRoleList.set([{ role_id: 9 }]);
      expect(service.canEditOicr()).toBe(true);
    }
  );

  it.each([10, 12, 13, 14] as const)(
    'canEditOicr should be false when editing, user is not admin, and status is intermediate (%s)',
    intermediateStatusId => {
      editingOicr = true;
      statusId = intermediateStatusId;
      userRoleList.set([{ role_id: 2 }]);
      expect(service.canEditOicr()).toBe(false);
    }
  );
});
