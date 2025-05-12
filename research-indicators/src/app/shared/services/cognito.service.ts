import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CacheService } from '@services/cache/cache.service';
import { ApiService } from '@services/api.service';
import { ActionsService } from '@services/actions.service';
import { ClarityService } from './clarity.service';
import { environment } from '../../../environments/environment';

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

  redirectToCognito() {
    window.location.href =
      `${environment.cognitoDomain}oauth2/authorize` +
      `?response_type=code` +
      `&client_id=${environment.cognitoClientId}` +
      `&redirect_uri=${environment.cognitoRedirectUri}` +
      `&scope=openid+email+profile` +
      `&identity_provider=${environment.cognitoIdentityProvider}`;
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
          event: () => this.redirectToCognito()
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
