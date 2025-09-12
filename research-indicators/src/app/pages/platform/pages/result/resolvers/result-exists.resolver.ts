import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { GetMetadataService } from '@shared/services/get-metadata.service';
import { CacheService } from '@shared/services/cache/cache.service';

export const resultExistsResolver: ResolveFn<boolean> = async route => {
  const metadataService = inject(GetMetadataService);
  const router = inject(Router);
  const cacheService = inject(CacheService);
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
  
  const success = await metadataService.update(id, platform);

  if (!success) {
    router.navigate(['/results-center']);
    return false;
  }

  return true;
};
