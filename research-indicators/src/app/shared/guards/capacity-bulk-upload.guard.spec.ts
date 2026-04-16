import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { capacityBulkUploadGuard } from './capacity-bulk-upload.guard';
import { RolesService } from '@services/cache/roles.service';

describe('capacityBulkUploadGuard', () => {
  let roles: jest.Mocked<Pick<RolesService, 'canAccessCapacityBulkUpload'>>;
  let router: Router;

  beforeEach(() => {
    roles = {
      canAccessCapacityBulkUpload: jest.fn().mockReturnValue(true)
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: RolesService, useValue: roles },
        {
          provide: Router,
          useValue: { createUrlTree: jest.fn((commands: unknown[]) => ({ commands })) }
        }
      ]
    });
    router = TestBed.inject(Router);
  });

  it('allows match when canAccessCapacityBulkUpload is true', () => {
    const result = TestBed.runInInjectionContext(() => capacityBulkUploadGuard({} as any, []));
    expect(result).toBe(true);
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('redirects to home when user cannot access bulk upload', () => {
    roles.canAccessCapacityBulkUpload.mockReturnValue(false);
    TestBed.runInInjectionContext(() => capacityBulkUploadGuard({} as any, []));
    expect(router.createUrlTree).toHaveBeenCalledTimes(1);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/home']);
  });
});
