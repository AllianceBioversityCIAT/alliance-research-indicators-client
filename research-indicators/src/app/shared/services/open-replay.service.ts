import { Injectable, inject } from '@angular/core';
import Tracker from '@openreplay/tracker';
import { environment } from '../../../environments/environment';
import { CacheService } from './cache/cache.service';

@Injectable({
  providedIn: 'root'
})
export class OpenReplayService {
  tracker: Tracker | null = null;
  private cache = inject(CacheService);

  constructor() {
    this.start();
  }

  async start() {
    if (environment.production) {
      this.tracker = new Tracker({
        projectKey: environment.openReplayProjectKey
      });

      await this.tracker.start();
      this.updateUserInfo();
    }
  }

  updateUserInfo() {
    if (this.tracker && this.cache.dataCache()?.user) {
      const user = this.cache.dataCache().user;
      this.tracker.setUserID(`${user.first_name} ${user.last_name}`);
      this.tracker.setMetadata('email', user.email || '');
      this.tracker.setMetadata('role', user.roleName || '');
    }
  }
}
