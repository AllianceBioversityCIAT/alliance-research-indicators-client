import { inject, Injectable, signal } from '@angular/core';
import { CacheService } from '@services/cache/cache.service';
import { Router } from '@angular/router';
import { DataCache } from '@interfaces/cache.interface';

@Injectable({
  providedIn: 'root'
})
export class ActionsService {
  cache = inject(CacheService);
  router = inject(Router);
  toastMessage = signal<{ severity: 'success' | 'info' | 'warning' | 'error'; summary: string; detail: string } | null>(null);
  saveCurrentSectionValue = signal(false);

  constructor() {
    this.validateToken();
  }

  saveCurrentSection() {
    this.saveCurrentSectionValue.set(true);

    setTimeout(() => {
      this.saveCurrentSectionValue.set(false);
    }, 500);
  }

  showToast(severity: 'success' | 'info' | 'warning' | 'error', summary: string, detail: string) {
    this.toastMessage.set({ severity, summary, detail });
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
    if (this.isCacheEmpty() || this.cache.dataCache().exp < currentTimeInSeconds) {
      this.cache.isLoggedIn.set(false);
      this.cache.dataCache.set(new DataCache());
      localStorage.removeItem('data');
      this.router.navigate(['/']);
    }
  }

  isCacheEmpty() {
    const { access_token, exp, user } = this.cache.dataCache();
    return !access_token || !exp || !user;
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
