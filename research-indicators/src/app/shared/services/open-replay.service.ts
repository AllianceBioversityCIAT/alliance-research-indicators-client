import { Injectable } from '@angular/core';
import Tracker from '@openreplay/tracker';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OpenReplayService {
  tracker = new Tracker({
    projectKey: environment.openReplayProjectKey
  });

  constructor() {
    this.start();
  }

  async start() {
    await this.tracker.start();
  }
}
