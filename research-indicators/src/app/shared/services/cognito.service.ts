import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CacheService } from './cache.service';
import { DynamicToastService } from './dynamic-toast.service';
import { ApiService } from './api.service';
import { WebsocketService } from '../sockets/websocket.service';
import { environment } from '../../../environments/environment';
import { ActionsService } from './actions.service';

@Injectable({
  providedIn: 'root'
})
export class CognitoService {
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  cache = inject(CacheService);
  dynamicToastSE = inject(DynamicToastService);
  api = inject(ApiService);
  websocket = inject(WebsocketService);
  actions = inject(ActionsService);

  redirectToCognito() {
    window.open(environment.cognitoUrl);
  }

  async validateCognitoCode() {
    const { code } = this.activatedRoute.snapshot.queryParams || {};
    if (!code) return;
    this.cache.isValidatingToken.set(true);
    const loginResponse = await this.api.login(code);
    const {
      decoded: { exp }
    } = this.actions.decodeToken(loginResponse.data.access_token);

    loginResponse.data.user.roleName = loginResponse.data.user?.user_role_list[0]?.role?.name ?? '';
    localStorage.setItem('data', JSON.stringify({ ...loginResponse.data, exp }));
    if (loginResponse.data.user.first_name && loginResponse.data.user.sec_user_id) await this.websocket.configUser(loginResponse.data.user.first_name, loginResponse.data.user.sec_user_id);

    this.dynamicToastSE.toastMessage.set({ severity: 'success', summary: 'Success', detail: 'You are now logged in' });
    this.updateCacheService();
    this.router.navigate(['/']);
  }

  updateCacheService() {
    this.cache.dataCache.set(localStorage.getItem('data') ? JSON.parse(localStorage.getItem('data') ?? '') : {});
    this.cache.isLoggedIn.set(true);
    this.cache.isValidatingToken.set(false);
  }
}
