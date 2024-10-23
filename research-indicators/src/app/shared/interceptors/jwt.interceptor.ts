import { HttpInterceptorFn } from '@angular/common/http';
import { CacheService } from '../services/cache.service';
import { inject } from '@angular/core';
import { ActionsService } from '../services/actions.service';
import { environment } from '../../../environments/environment';
// import { ActionsService } from '../services/actions.service';

export const jWtInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtToken = inject(CacheService).dataCache().access_token;
  const targetDomain = environment.mainApiUrl;
  if (req.url.includes(targetDomain)) inject(ActionsService).isTokenExpired();

  if (!req.headers.has('Authorization')) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${jwtToken}`
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};
