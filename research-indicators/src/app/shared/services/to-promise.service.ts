import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom, map } from 'rxjs';
import { MainResponse } from '../interfaces/responses.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ToPromiseService {
  constructor(public http: HttpClient) {}

  private TP = (subscription: Observable<any>): Promise<MainResponse<any>> => {
    return new Promise(async resolve => {
      try {
        resolve(await firstValueFrom(subscription.pipe(map(data => ({ ...data, successfulRequest: true })))));
      } catch (error: any) {
        console.error(error);
        resolve({ ...error, successfulRequest: false, errorDetail: error?.error?.description });
      }
    });
  };

  post = <T, B>(url: string, body: B, config?: Config) => {
    let headers = new HttpHeaders();
    if (config?.token) {
      headers = headers.set('Authorization', `Bearer ${config.token}`);
    }
    return this.TP(this.http.post<T>(this.getEnv(config?.isAuth) + url, body, { headers }));
  };

  put = <T, B>(url: string, body: B, config?: Config) => {
    return this.TP(this.http.put<T>(this.getEnv(config?.isAuth) + url, body));
  };

  get = <T>(url: string, config?: Config) => {
    return this.TP(this.http.get<T>(this.getEnv(config?.isAuth) + url));
  };

  patch = <T, B>(url: string, body: B, config?: Config) => {
    return this.TP(this.http.patch<T>(this.getEnv(config?.isAuth) + url, body));
  };

  getEnv = (isAuth: boolean | undefined) => {
    return isAuth ? environment.managementApiUrl : environment.mainApiUrl;
  };
}

interface Config {
  token?: string;
  isAuth?: boolean;
}
