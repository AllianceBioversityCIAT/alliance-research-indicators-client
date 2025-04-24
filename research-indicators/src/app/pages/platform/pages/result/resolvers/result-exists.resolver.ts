import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { GetMetadataService } from '@shared/services/get-metadata.service';

export const resultExistsResolver: ResolveFn<boolean> = async (route) => {
  const metadataService = inject(GetMetadataService);
  const router = inject(Router);
  const id = Number(route.paramMap.get('id'));

  const success = await metadataService.update(id);

  if (!success) {
    router.navigate(['/results-center']);
    return false;
  }

  return true;
};
