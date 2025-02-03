import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom, map, catchError, finalize } from 'rxjs';
import { MainResponse } from '../interfaces/responses.interface';
import { environment } from '../../../environments/environment';
import { CacheService } from './cache/cache.service';

@Injectable({
  providedIn: 'root'
})
export class ToPromiseService {
  http = inject(HttpClient);
  cacheService = inject(CacheService);

  private TP = (subscription: Observable<any>, loadingTrigger?: boolean): Promise<MainResponse<any>> => {
    if (loadingTrigger) this.cacheService.currentResultIsLoading.set(true);
    return firstValueFrom(
      subscription.pipe(
        map(data => ({ ...data, successfulRequest: true })),
        catchError(error => {
          console.error(error);
          return [{ ...error, successfulRequest: false, errorDetail: error?.error }];
        }),
        finalize(() => {
          if (loadingTrigger) this.cacheService.currentResultIsLoading.set(false);
        })
      )
    );
  };

  post = <T, B>(url: string, body: B, config?: Config) => {
    let headers = new HttpHeaders();
    if (config?.token) {
      headers = headers.set('Authorization', `Bearer ${config.token}`);
    }
    if (config?.isRefreshToken) {
      headers = headers.set('refresh-token', `${config.token}`);
    }
    return this.TP(this.http.post<T>(this.getEnv(config?.isAuth) + url, body, { headers }));
  };

  put = <T, B>(url: string, body: B, config?: Config) => {
    return this.TP(this.http.put<T>(this.getEnv(config?.isAuth) + url, body));
  };

  get = <T>(url: string, config?: Config) => {
    return this.TP(this.http.get<T>(this.getEnv(config?.isAuth) + url), config?.loadingTrigger);
  };

  patch = <T, B>(url: string, body: B, config?: Config) => {
    return this.TP(this.http.patch<T>(this.getEnv(config?.isAuth) + url, body));
  };

  getEnv = (isAuth: boolean | string | undefined) => {
    if (typeof isAuth === 'string') return isAuth;
    return isAuth ? environment.managementApiUrl : environment.mainApiUrl;
  };
}

interface Config {
  token?: string;
  isAuth?: boolean | string;
  isRefreshToken?: boolean;
  loadingTrigger?: boolean;
}
