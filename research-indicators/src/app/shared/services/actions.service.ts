import { inject, Injectable } from '@angular/core';
import { CacheService } from './cache.service';
import { Router } from '@angular/router';
import { DataCache } from '../interfaces/cache.interface';

@Injectable({
  providedIn: 'root'
})
export class ActionsService {
  cache = inject(CacheService);
  router = inject(Router);

  constructor() {
    this.validateToken();
  }

  validateToken() {
    if (this.cache.dataCache().access_token) this.cache.isLoggedIn.set(true);
  }

  logOut() {
    localStorage.removeItem('data');
    this.cache.isLoggedIn.set(false);
    this.router.navigate(['/']);
  }

  isTokenExpired() {
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    if (!this.cache.dataCache().access_token || this.cache.dataCache().exp < currentTimeInSeconds) {
      this.cache.isLoggedIn.set(false);
      this.cache.dataCache.set(new DataCache());
      localStorage.removeItem('data');
      this.router.navigate(['/']);
    }
  }

  decodeToken(token: string) {
    const base64UrlToBase64 = (input: string) => {
      let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      return base64;
    };

    const decodeJwtPayload = (token: string) => {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('JWT not valid');
      }

      const payloadBase64 = base64UrlToBase64(parts[1]);
      const decodedPayload = atob(payloadBase64);
      return JSON.parse(decodedPayload);
    };

    return { decoded: decodeJwtPayload(token), token };
  }
}
