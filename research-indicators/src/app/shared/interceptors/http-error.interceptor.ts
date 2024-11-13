import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { ActionsService } from '@services/actions.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const actions = inject(ActionsService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      actions.showToast({ detail: error.error.errors, severity: 'error', summary: 'Error saving section', sticky: true });
      return throwError(() => error);
    })
  );
};
