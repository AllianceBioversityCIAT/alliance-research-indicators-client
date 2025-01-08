import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CacheService } from '@services/cache/cache.service';
import { ApiService } from '@services/api.service';
import { WebsocketService } from '../sockets/websocket.service';
import { environment } from '@envs/environment';
import { ActionsService } from '@services/actions.service';
import { SoundService } from './sound.service';

@Injectable({
  providedIn: 'root'
})
export class CognitoService {
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  cache = inject(CacheService);
  api = inject(ApiService);
  websocket = inject(WebsocketService);
  actions = inject(ActionsService);
  soundService = inject(SoundService);
  redirectToCognito() {
    window.location.href = environment.cognitoUrl;
  }

  async validateCognitoCode() {
    const { code } = this.activatedRoute.snapshot.queryParams || {};
    if (!code) return;
    this.cache.isValidatingToken.set(true);
    const loginResponse = await this.api.login(code);
    if (!loginResponse.successfulRequest) {
      this.actions.showGlobalAlert({
        severity: 'error',
        summary: 'Error authenticating',
        detail: loginResponse.errorDetail.errors,
        callbacks: [
          { label: 'Close', event: () => this.router.navigate(['/']) },
          { label: 'Retry Log in', event: () => this.redirectToCognito() }
        ]
      });
      return;
    }
    const {
      decoded: { exp }
    } = this.actions.decodeToken(loginResponse.data.access_token);

    loginResponse.data.user.roleName = loginResponse.data.user?.user_role_list[0]?.role?.name ?? '';
    localStorage.setItem('data', JSON.stringify({ ...loginResponse.data, exp }));
    if (loginResponse.data.user.first_name && loginResponse.data.user.sec_user_id) await this.websocket.configUser(loginResponse.data.user.first_name, loginResponse.data.user.sec_user_id);

    this.actions.showToast({ severity: 'success', summary: 'Success', detail: 'You are now logged in' });
    this.soundService.playLoginAudio();
    this.updateCacheService();
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 2000);
  }

  updateCacheService() {
    this.cache.dataCache.set(localStorage.getItem('data') ? JSON.parse(localStorage.getItem('data') ?? '') : {});
    this.cache.isLoggedIn.set(true);
    this.cache.isValidatingToken.set(false);
  }
}
