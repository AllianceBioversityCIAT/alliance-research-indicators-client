import { HttpInterceptorFn } from '@angular/common/http';
import { CacheService } from '@services/cache/cache.service';
import { inject } from '@angular/core';
import { ActionsService } from '@services/actions.service';
import { environment } from '@envs/environment';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
// import { ActionsService } from '../services/actions.service';

export const jWtInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtToken = inject(CacheService).dataCache().access_token;
  const targetDomain = environment.mainApiUrl;

  if (req.url.includes(targetDomain)) {
    return from(inject(ActionsService).isTokenExpired()).pipe(
      switchMap(tokenValidation => {
        if (!req.headers.has('Authorization')) {
          const clonedRequest = req.clone({
            setHeaders: {
              Authorization: `Bearer ${tokenValidation.isTokenExpired ? tokenValidation?.token_data?.access_token : jwtToken}`
            }
          });
          return next(clonedRequest);
        }
        return next(req);
      })
    );
  }
  return next(req);
};
