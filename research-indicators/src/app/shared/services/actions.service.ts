import { inject, Injectable, signal, computed } from '@angular/core';
import { CacheService } from '@services/cache/cache.service';
import { Router } from '@angular/router';
import { GlobalAlert } from '../interfaces/global-alert.interface';
import { ToastMessage } from '../interfaces/toast-message.interface';
import { ApiService } from './api.service';
import { LoginRes, TokenValidation } from '../interfaces/responses.interface';
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

  async logOut() {
    // Clear localStorage
    localStorage.removeItem('data');
    this.cache.isLoggedIn.set(false);
    // Navigate to home first
    try {
      await this.router.navigate(['/']);
    } catch (navError) {
      console.error('Navigation error:', navError);
    }

    // Then clear caches in the background
    if ('serviceWorker' in navigator) {
      try {
        const cacheNames = await caches.keys();

        const deletions = cacheNames.map(async cacheName => {
          if (cacheName.includes('ngsw:/:dynamic-data') || cacheName.includes('ngsw:/:semi-dynamic-data')) {
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        });

        await Promise.all(deletions);

        // Check if service worker is available and registered
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          try {
            const registration = await navigator.serviceWorker.ready;
            if (registration) {
              await registration.update();
            }
          } catch (swError) {
            console.error('Service worker update error:', swError);
          }
        }
      } catch (error) {
        console.error('Cache clearing error:', error);
      }
    }
  }

  isTokenExpired(): Promise<TokenValidation> {
    return new Promise(resolve => {
      // Obtener timestamp UTC actual en milisegundos y convertir a segundos
      const utcNow = new Date().getTime();
      const currentTimeInSeconds = Math.floor(utcNow / 1000);

      // El campo exp del JWT es un timestamp UTC en segundos
      const tokenExp = this.cache.dataCache().exp;

      // Comparamos directamente ya que ambos están en UTC
      if (this.isCacheEmpty() || tokenExp < currentTimeInSeconds) {
        this.api.refreshToken(this.cache.dataCache().refresh_token).then(response => {
          if (response.successfulRequest) {
            this.updateLocalStorage(response, true);
            resolve({ token_data: response.data, isTokenExpired: true });
          } else {
            this.cache.isLoggedIn.set(false);
            this.cache.dataCache.set(new DataCache());
            localStorage.removeItem('data');
            this.router.navigate(['/']);
            resolve({ token_data: response.data, isTokenExpired: true });
          }
        });
      } else {
        // El token aún es válido (la comparación fue en UTC)
        resolve({ isTokenExpired: false });
      }
    });
  }

  updateLocalStorage(loginResponse: MainResponse<LoginRes>, isRefreshToken = false) {
    const {
      decoded: { exp }
    } = this.decodeToken(loginResponse.data.access_token);

    if (isRefreshToken) {
      this.cache.dataCache.update(prev => ({
        ...prev,
        access_token: loginResponse.data.access_token,
        exp: exp // exp ya está en UTC
      }));
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
