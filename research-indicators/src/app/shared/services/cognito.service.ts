import { inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CacheService } from '@services/cache/cache.service';
import { ApiService } from '@services/api.service';
import { ActionsService } from '@services/actions.service';
import { ClarityService } from './clarity.service';

@Injectable({
  providedIn: 'root'
})
export class CognitoService {
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  cache = inject(CacheService);
  api = inject(ApiService);
  actions = inject(ActionsService);
  clarity = inject(ClarityService);

  isLoadingAzureAd = signal(false);

  async loginWithAzureAd() {
    if (this.isLoadingAzureAd()) return;

    this.isLoadingAzureAd.set(true);

    const res = await this.api.loginWithAzureAd(23, 'CGIAR-AzureAD');

    if (!res.authUrl) {
      this.actions.showToast({
        severity: 'error',
        summary: 'Server Error',
        detail: 'Error while trying to login with Azure AD'
      });
      this.isLoadingAzureAd.set(false);

      return;
    }

    window.location.href = res.authUrl;

    this.isLoadingAzureAd.set(false);
  }

  async validateCognitoCode() {
    const { code } = this.activatedRoute.snapshot.queryParams ?? {};
    if (!code) return;

    this.cache.isValidatingToken.set(true);
    const loginResponse = await this.api.login(code);
    if (!loginResponse.successfulRequest) {
      this.actions.showGlobalAlert({
        severity: 'error',
        summary: 'Error authenticating',
        detail: loginResponse.errorDetail.errors,
        cancelCallback: {
          label: 'Cancel',
          event: () => this.router.navigate(['/login'])
        },
        confirmCallback: {
          label: 'Retry Log in',
          event: () => this.loginWithAzureAd()
        }
      });
      return;
    }

    this.actions.updateLocalStorage(loginResponse);

    this.updateCacheService();
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 2000);
  }

  updateCacheService() {
    this.cache.dataCache.set(localStorage.getItem('data') ? JSON.parse(localStorage.getItem('data') ?? '') : {});
    this.cache.isLoggedIn.set(true);
    this.cache.isValidatingToken.set(false);
    this.clarity.updateUserInfo();
  }
}
