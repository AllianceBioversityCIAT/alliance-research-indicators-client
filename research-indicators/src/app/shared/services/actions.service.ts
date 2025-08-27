import { inject, Injectable, signal, computed } from '@angular/core';
import { CacheService } from '@services/cache/cache.service';
import { Router } from '@angular/router';
import { GlobalAlert } from '../interfaces/global-alert.interface';
import { ToastMessage } from '../interfaces/toast-message.interface';
import { ApiService } from './api.service';
import { LoginRes, TokenValidation, MainResponse } from '../interfaces/responses.interface';
import { DataCache } from '../interfaces/cache.interface';
import { ExtendedHttpErrorResponse } from '@shared/interfaces/http-error-response.interface';
import { Result } from '@shared/interfaces/result/result.interface';
import { CreateResultResponse } from '@shared/components/all-modals/modals-content/create-result-modal/models/AIAssistantResult';
import { ServiceLocatorService } from './service-locator.service';

@Injectable({
  providedIn: 'root'
})
export class ActionsService {
  cache = inject(CacheService);
  router = inject(Router);
  api = inject(ApiService);
  serviceLocator = inject(ServiceLocatorService);
  toastMessage = signal<ToastMessage>({ severity: 'info', summary: '', detail: '' });
  saveCurrentSectionValue = signal(false);
  globalAlertsStatus = signal<GlobalAlert[]>([]);

  constructor() {
    this.validateToken();
    this.listenToWindowHeight();
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

  handleBadRequest(result: MainResponse<CreateResultResponse | Result | ExtendedHttpErrorResponse>, action?: () => void) {
    const isWarning = result.status === 409;
    const errorDetail = result.errorDetail;

    const id = typeof errorDetail.errors === 'object' && errorDetail.errors !== null ? errorDetail.errors['result_official_code'] : undefined;

    const linkUrl = id ? `result/${id}/general-information` : '#';

    const [initialText, existingResult = ''] = errorDetail.description.split(':').map(s => s.trim());
    const [boldText, ...regularParts] = existingResult.split('-').map(s => s.trim());

    const detailHtml = `
      ${initialText}:
      <a href="${linkUrl}" target="_blank" class="alert-link-custom">
        <span class="alert-link-bold">${boldText}</span> - ${regularParts.join(' - ')}
      </a>
    `;

    this.showGlobalAlert({
      severity: isWarning ? 'secondary' : 'error',
      summary: isWarning ? 'Title Already Exists' : 'Error',
      detail: detailHtml,
      hasNoCancelButton: true,
      generalButton: true,
      confirmCallback: {
        label: 'Enter other title',
        event: () => {
          if (action) {
            action();
          }
        }
      },
      buttonColor: '#035BA9'
    });
  }

  showToast(toastMessage: ToastMessage) {
    this.toastMessage.set(toastMessage);
  }

  showGlobalAlert(globalAlert: GlobalAlert) {
    if (globalAlert.serviceName) {
      this.serviceLocator.clearService(globalAlert.serviceName);
    }
    this.globalAlertsStatus.update(prev => [...prev, globalAlert]);
  }

  hideGlobalAlert(index: number) {
    this.globalAlertsStatus.update(prev => prev.filter((_, i) => i !== index));
  }

  getInitials = computed(() => {
    const user = this.cache.dataCache().user;
    const firstInitial = user.first_name?.[0] ?? '';
    const lastInitial = user.last_name?.split(' ')[0]?.[0] ?? '';
    return (firstInitial + lastInitial).toUpperCase();
  });

  validateToken() {
    if (this.cache.dataCache().access_token) this.cache.isLoggedIn.set(true);
  }

  async logOut() {
    // Clear localStorage
    localStorage.removeItem('data');
    localStorage.removeItem('isSidebarCollapsed');
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
        if (navigator.serviceWorker?.controller) {
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
      // Get current UTC timestamp in milliseconds and convert to seconds
      const utcNow = new Date().getTime();
      const currentTimeInSeconds = Math.floor(utcNow / 1000);

      // The exp field of the JWT is a timestamp in UTC seconds
      const tokenExp = this.cache.dataCache().exp;

      // Compare directly since both are in UTC
      if (this.isCacheEmpty() || tokenExp < currentTimeInSeconds) {
        this.api
          .refreshToken(this.cache.dataCache().refresh_token)
          .then(response => {
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
          })
          .catch(error => {
            resolve(Promise.reject(new Error(error instanceof Error ? error.message : String(error))));
          });
      } else {
        // The token is still valid (the comparison was in UTC)
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
        exp: exp // exp is already in UTC
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

  listenToWindowHeight(): void {
    const updateHeight = () => {
      this.cache.windowHeight.set(window.innerHeight);
    };

    // Update initial height
    updateHeight();

    // Subscribe to window resize
    window.addEventListener('resize', updateHeight);
  }
}
