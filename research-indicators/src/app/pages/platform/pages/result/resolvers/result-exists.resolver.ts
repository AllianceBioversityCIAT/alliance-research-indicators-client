import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { GetMetadataService } from '@shared/services/get-metadata.service';
import { CurrentResultService } from '../../../../../shared/services/cache/current-result.service';

export const resultExistsResolver: ResolveFn<boolean> = async route => {
  const metadataService = inject(GetMetadataService);
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
    platform = 'STAR'; // Default platform for numeric IDs
  }

  const metadataRules = await metadataService.update(id, platform);

  if (!metadataRules.canOpen) {
    router.navigate(['/results-center']);
    return false;
  }

  if (currentResultService.validateOpenResult(metadataRules.indicator_id ?? 0, metadataRules.status_id ?? 0)) {
    router.navigate(['/project-detail/A100']);
    currentResultService.openEditRequestdOicrsModal(
      metadataRules.indicator_id ?? 0,
      metadataRules.status_id ?? 0,
      metadataRules.result_official_code ?? 0
    );
    return false;
  }

  return true;
};
