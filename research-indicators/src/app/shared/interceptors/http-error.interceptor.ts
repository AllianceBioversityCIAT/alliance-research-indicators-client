import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, timeout, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { ActionsService } from '@services/actions.service';
import { CacheService } from '../services/cache/cache.service';
import { ApiService } from '../services/api.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const actions = inject(ActionsService);
  const cache = inject(CacheService);
  const api = inject(ApiService);

  // Skip timeout for error endpoint to avoid infinite loop
  if (req.url.includes('ciat-errors.yecksin.workers.dev')) {
    return next(req);
  }

  return next(req).pipe(
    timeout(5000), // 5 seconds timeout
    catchError((error: HttpErrorResponse | Error) => {
      const now = new Date();
      const errorObj = {
        path: req.url,
        status: error instanceof HttpErrorResponse ? 'error' : 'pending',
        timestamp: now.toLocaleString(),
        message: error instanceof HttpErrorResponse ? error.message : 'Request is taking longer than 5 seconds to respond',
        original_error: error
      };

      // Send error to tracking endpoint
      api.saveErrors(errorObj).catch(console.error);

      if (cache.isLoggedIn() && error instanceof HttpErrorResponse && error.status !== 409) {
        actions.showToast({ detail: error.error.errors, severity: 'error', summary: 'Error', sticky: true });
      }

      return throwError(() => error);
    })
  );
};
