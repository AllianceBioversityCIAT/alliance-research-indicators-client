import { Injectable, inject } from '@angular/core';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  cache = inject(CacheService);

  isAdmin() {
    return this.cache.dataCache().user.user_role_list.some(role => role.role_id === 9);
  }
}
