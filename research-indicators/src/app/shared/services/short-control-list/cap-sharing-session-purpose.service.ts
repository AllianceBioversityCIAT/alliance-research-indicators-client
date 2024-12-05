import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { SessionPurpose } from '../../interfaces/get-session-purpose.interface';

@Injectable({
  providedIn: 'root'
})
export class CapSharingSessionPurposeService {
  api = inject(ApiService);
  list = signal<SessionPurpose[]>([]);
  loading = signal(false);
  constructor() {
    this.main();
  }

  async main() {
    this.loading.set(true);
    const response = await this.api.GET_SessionPurpose();
    this.list.set(response.data);
    this.loading.set(false);
  }
}
