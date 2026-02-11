import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { GetMetadataService } from '@shared/services/get-metadata.service';
import { CurrentResultService } from '../../../../../shared/services/cache/current-result.service';
import { CacheService } from '../../../../../shared/services/cache/cache.service';
import { PLATFORM_CODES } from '@shared/constants/platform-codes';
import { RolesService } from '@shared/services/cache/roles.service';

export const resultExistsResolver: ResolveFn<boolean> = async route => {
  const metadataService = inject(GetMetadataService);
  const cacheService = inject(CacheService);
  const currentResultService = inject(CurrentResultService);
  const router = inject(Router);
  const idParam = route.paramMap.get('id');
  const rolesService = inject(RolesService);

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
    const isDraft =  (status_id ?? 0) === 10 || (status_id ?? 0) === 12 || (status_id ?? 0) === 13;
    if (!isDraft || (isDraft && !rolesService.isAdmin())) {
      router.navigate(['/project-detail', result_contract_id]);
      if (!router.url.includes('/project-detail/')) cacheService.projectResultsSearchValue.set(result_title ?? '');
      currentResultService.openEditRequestdOicrsModal(indicator_id ?? 0, status_id ?? 0, result_official_code ?? 0);
      return false;
    }
    return true;
  }

  return true;
};