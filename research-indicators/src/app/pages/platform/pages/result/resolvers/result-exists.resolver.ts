import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { GetMetadataService } from '@shared/services/get-metadata.service';
import { CurrentResultService } from '../../../../../shared/services/cache/current-result.service';
import { CacheService } from '../../../../../shared/services/cache/cache.service';
import { PLATFORM_CODES } from '@shared/constants/platform-codes';
import { RolesService } from '@shared/services/cache/roles.service';
import { RESULT_ENTRY_SOURCE_QUERY, RESULT_ENTRY_SOURCE_VALUE_RESULTS_CENTER } from '@shared/constants/result-entry-source';
import { OicrResolverMetadata } from '@shared/interfaces/oicr-resolver-metadata.interface';

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

  const oicrResolveOutcome = await tryOpenOicrEditorFromResolver(route, router, cacheService, currentResultService, rolesService, {
    indicator_id,
    status_id,
    result_official_code,
    result_contract_id,
    result_title
  });
  if (oicrResolveOutcome !== undefined) {
    return oicrResolveOutcome;
  }

  return true;
};

async function tryOpenOicrEditorFromResolver(
  route: ActivatedRouteSnapshot,
  router: Router,
  cacheService: CacheService,
  currentResultService: CurrentResultService,
  rolesService: RolesService,
  meta: OicrResolverMetadata
): Promise<boolean | undefined> {
  const { indicator_id, status_id, result_official_code, result_contract_id, result_title } = meta;

  if (!currentResultService.validateOpenResult(indicator_id ?? 0, status_id ?? 0)) {
    return undefined;
  }

  const isDraft = (status_id ?? 0) === 10 || (status_id ?? 0) === 12 || (status_id ?? 0) === 13;
  if (!isDraft || (isDraft && !rolesService.isAdmin())) {
    const fromResultsCenter = route.queryParamMap.get(RESULT_ENTRY_SOURCE_QUERY) === RESULT_ENTRY_SOURCE_VALUE_RESULTS_CENTER;
    if (fromResultsCenter) {
      await router.navigate(['/results-center']);
    } else {
      await router.navigate(['/project-detail', result_contract_id]);
      if (!router.url.includes('/project-detail/')) cacheService.projectResultsSearchValue.set(result_title ?? '');
    }
    await currentResultService.openEditRequestdOicrsModal(
      indicator_id ?? 0,
      status_id ?? 0,
      result_official_code ?? 0,
      fromResultsCenter ? 'results-center' : 'project'
    );
    return false;
  }
  return true;
}
