import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { GetMetadataService } from '@shared/services/get-metadata.service';
import { CurrentResultService } from '../../../../../shared/services/cache/current-result.service';
import { CacheService } from '../../../../../shared/services/cache/cache.service';
import { PLATFORM_CODES } from '@shared/constants/platform-codes';

export const resultExistsResolver: ResolveFn<boolean> = async route => {
  const metadataService = inject(GetMetadataService);
  const cacheService = inject(CacheService);
  const currentResultService = inject(CurrentResultService);
  const router = inject(Router);
  const idParam = route.paramMap.get('id');

  let id: number;
  let platform: string | null = null;

  if (typeof idParam === 'string' && idParam.includes('-')) {
    const parts = idParam.split('-');
    platform = parts[0]; // TP, PRMS, etc.
    const lastPart = parts[parts.length - 1];
    id = parseInt(lastPart, 10);
  } else {
    id = Number(idParam);
    platform = PLATFORM_CODES.STAR; // Default platform for numeric IDs
  }

  const { canOpen, indicator_id, status_id, result_official_code, result_contract_id, result_title } =
    (await metadataService.update(id, platform)) || {};

  if (!canOpen) {
    router.navigate(['/results-center']);
    return false;
  }

  if (currentResultService.validateOpenResult(indicator_id ?? 0, status_id ?? 0)) {
    // Accepted (10), Science Edition (12), KM Curation (13), Published (14) are intermediate workflow stages
    const isIntermediateStatus = (status_id ?? 0) === 10 || (status_id ?? 0) === 12 || (status_id ?? 0) === 13 || (status_id ?? 0) === 14;
    
    const userRoles = cacheService.dataCache().user?.user_role_list ?? [];
    const isAdmin = userRoles.some(role => role.role_id === 9 || role.role_id === 1);
    
    // For intermediate statuses (10, 12, 13, 14), regular users cannot access the full form
    // Only admins can edit OICRs in these statuses
    if (isIntermediateStatus && !isAdmin) {
      router.navigate(['/results-center']);
      return false;
    }
    
    if (!isIntermediateStatus) {
      router.navigate(['/project-detail', result_contract_id]);
      if (!router.url.includes('/project-detail/')) cacheService.projectResultsSearchValue.set(result_title ?? '');
      currentResultService.openEditRequestdOicrsModal(indicator_id ?? 0, status_id ?? 0, result_official_code ?? 0);
      return false;
    }
    
    // Admins can access intermediate statuses - allow navigation
    return true;
  }

  return true;
};
