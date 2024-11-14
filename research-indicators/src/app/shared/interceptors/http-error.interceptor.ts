import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { ActionsService } from '@services/actions.service';
import { CacheService } from '../services/cache/cache.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const actions = inject(ActionsService);
  const cache = inject(CacheService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (cache.isLoggedIn()) {
        actions.showToast({ detail: error.error.errors, severity: 'error', summary: 'Error', sticky: true });
      }

      return throwError(() => error);
    })
  );
};
