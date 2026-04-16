import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { RolesService } from '@services/cache/roles.service';

export const capacityBulkUploadGuard: CanMatchFn = () => {
  const roles = inject(RolesService);
  const router = inject(Router);
  if (roles.canAccessCapacityBulkUpload()) {
    return true;
  }
  return router.createUrlTree(['/home']);
};
