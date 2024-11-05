import { inject, Injectable, signal } from '@angular/core';
import { CacheService } from '@services/cache/cache.service';
import { Router } from '@angular/router';
import { DataCache } from '@interfaces/cache.interface';
import { GlobalAlert } from '../interfaces/global-alert.interface';
import { ToastMessage } from '../interfaces/toast-message.interface';

@Injectable({
  providedIn: 'root'
})
export class ActionsService {
  cache = inject(CacheService);
  router = inject(Router);
  toastMessage = signal<ToastMessage>({ severity: 'info', summary: '', detail: '' });
  saveCurrentSectionValue = signal(false);
  globalAlertsStatus = signal<GlobalAlert[]>([]);
  constructor() {
    this.validateToken();
  }

  saveCurrentSection() {
    this.saveCurrentSectionValue.set(true);

    setTimeout(() => {
      this.saveCurrentSectionValue.set(false);
    }, 500);
  }

  changeResultRoute(resultId: number) {
    this.router.navigate(['load-results'], { skipLocationChange: true }).then(() => {
      this.router.navigate(['result', resultId]);
    });
  }

  showToast(toastMessage: ToastMessage) {
    this.toastMessage.set(toastMessage);
  }

  showGlobalAlert(globalAlert: GlobalAlert) {
    this.globalAlertsStatus.update(prev => [...prev, globalAlert]);
  }

  hideGlobalAlert(index: number) {
    this.globalAlertsStatus.update(prev => prev.filter((_, i) => i !== index));
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
