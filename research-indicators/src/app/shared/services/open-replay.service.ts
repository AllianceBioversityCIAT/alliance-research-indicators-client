import { Injectable } from '@angular/core';
import Tracker from '@openreplay/tracker';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OpenReplayService {
  tracker: Tracker | null = null;

  constructor() {
    this.start();
  }

  async start() {
    if (environment.production) {
      this.tracker = new Tracker({
        projectKey: environment.openReplayProjectKey
      });
      await this.tracker.start();
    }
  }
}
