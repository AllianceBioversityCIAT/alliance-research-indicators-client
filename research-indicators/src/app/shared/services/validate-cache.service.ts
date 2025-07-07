import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import frontVersion from './../../../../public/config/version.json';

@Injectable({
  providedIn: 'root'
})
export class ValidateCacheService {
  api = inject(ApiService);

  async validateVersions() {
    const response = (await this.api.GET_GithubVersion()) as unknown as { version: string };
    const areVersionsEquals = response.version === frontVersion.version;
  }
}
