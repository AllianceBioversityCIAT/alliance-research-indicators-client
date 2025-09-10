import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { GetMetadataService } from '@shared/services/get-metadata.service';
import { CacheService } from '@shared/services/cache/cache.service';

export const resultExistsResolver: ResolveFn<boolean> = async route => {
  const metadataService = inject(GetMetadataService);
  const router = inject(Router);
  const cacheService = inject(CacheService);
  const idParam = route.paramMap.get('id');

  // Usar el método helper del CacheService para extraer el ID numérico
  let id: number;
  if (typeof idParam === 'string' && idParam.includes('-')) {
    // Extraer el número después del último guión (formato: result.platform_code-2863)
    const parts = idParam.split('-');
    const lastPart = parts[parts.length - 1];
    id = parseInt(lastPart, 10);
  } else {
    // Si es un número directo
    id = Number(idParam);
  }

  const success = await metadataService.update(id);

  if (!success) {
    router.navigate(['/results-center']);
    return false;
  }

  return true;
};
