import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, timer, merge, throwError, ignoreElements, from, switchMap } from 'rxjs';
import { inject } from '@angular/core';
import { ActionsService } from '@services/actions.service';
import { CacheService } from '../services/cache/cache.service';
import { ApiService } from '../services/api.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const actions = inject(ActionsService);
  const cache = inject(CacheService);
  const api = inject(ApiService);

  // Skip timeout check for error endpoint to avoid infinite loop
  if (req.url.includes('ciat-errors.yecksin.workers.dev')) {
    return next(req);
  }

  // Create a timer for 5 seconds
  const timeoutCheck = timer(5000).pipe(
    switchMap(() => {
      const now = new Date();
      const timeoutObj = {
        path: req.url,
        status: 'pending',
        timestamp: now.toLocaleString(),
        message: 'Request is taking longer than 5 seconds to respond',
        original_error: undefined
      };
      return from(api.saveErrors(timeoutObj));
    }),
    ignoreElements() // Ignore the timer values
  );

  // Use merge instead of race to run both observables
  return merge(
    timeoutCheck,
    next(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const now = new Date();
        const errorObj = {
          path: req.url,
          status: 'error',
          timestamp: now.toLocaleString(),
          message: error.message,
          original_error: error
        };

        // Send error to tracking endpoint
        from(api.saveErrors(errorObj)).subscribe();

        if (cache.isLoggedIn() && error.status !== 409) {
          actions.showToast({ detail: error.error.errors, severity: 'error', summary: 'Error', sticky: true });
        }

        return throwError(() => error);
      })
    )
  );
};
