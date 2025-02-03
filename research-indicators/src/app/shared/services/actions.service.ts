import { inject, Injectable, signal, computed } from '@angular/core';
import { CacheService } from '@services/cache/cache.service';
import { Router } from '@angular/router';
import { GlobalAlert } from '../interfaces/global-alert.interface';
import { ToastMessage } from '../interfaces/toast-message.interface';
import { ApiService } from './api.service';
import { LoginRes } from '../interfaces/responses.interface';
import { MainResponse } from '../interfaces/responses.interface';
import { DataCache } from '../interfaces/cache.interface';

@Injectable({
  providedIn: 'root'
})
export class ActionsService {
  cache = inject(CacheService);
  router = inject(Router);
  api = inject(ApiService);
  toastMessage = signal<ToastMessage>({ severity: 'info', summary: '', detail: '' });
  saveCurrentSectionValue = signal(false);
  globalAlertsStatus = signal<GlobalAlert[]>([]);
  private lastTokenCheck = signal<number>(0);

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

  getInitials = computed(() => {
    const name = `${this.cache.dataCache().user.first_name} ${this.cache.dataCache().user.last_name}`;
    const words = name.split(' ');
    if (words.length === 1) return words[0][0];
    if (words.length === 2) return words[0][0] + words[1][0];
    return words[0][0] + words[2][0];
  });

  validateToken() {
    if (this.cache.dataCache().access_token) this.cache.isLoggedIn.set(true);
  }

  logOut() {
    localStorage.removeItem('data');
    this.cache.isLoggedIn.set(false);
    this.router.navigate(['/']);
  }

  async isTokenExpired() {
    const now = Date.now();
    const timeSinceLastCheck = now - this.lastTokenCheck();

    // If less than 2 seconds have passed since the last check, do nothing
    if (timeSinceLastCheck < 1000) return;

    // Update timestamp of last check
    this.lastTokenCheck.set(now);

    const currentTimeInSeconds = Math.floor(now / 1000);
    if (this.isCacheEmpty() || this.cache.dataCache().exp < currentTimeInSeconds) {
      const response = await this.api.refreshToken(this.cache.dataCache().refresh_token);
      if (response.successfulRequest) {
        this.updateLocalStorage(response, true);
      } else {
        this.cache.isLoggedIn.set(false);
        this.cache.dataCache.set(new DataCache());
        localStorage.removeItem('data');
        this.router.navigate(['/']);
      }
    }
  }

  updateLocalStorage(loginResponse: MainResponse<LoginRes>, isRefreshToken = false) {
    const {
      decoded: { exp }
    } = this.decodeToken(loginResponse.data.access_token);
    if (isRefreshToken) {
      this.cache.dataCache.update(prev => {
        prev.access_token = loginResponse.data.access_token;
        prev.exp = exp;

        return { ...prev };
      });
      localStorage.setItem('data', JSON.stringify(this.cache.dataCache()));
    } else {
      loginResponse.data.user.roleName = loginResponse.data.user?.user_role_list[0]?.role?.name ?? '';
      localStorage.setItem('data', JSON.stringify({ ...loginResponse.data, exp }));
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
