import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import frontVersion from './../../../../public/config/version.json';

@Injectable({
  providedIn: 'root'
})
export class ValidateCacheService {
  api = inject(ApiService);

  async validateVersions() {
    //#1 - get current version from github
    const response = (await this.api.GET_GithubVersion()) as unknown as { version: string };

    //#2 - check if exists a last version validated and if it is the same as the current version
    if (this.getLastVersionValidated() && this.getLastVersionValidated() === response.version) return;

    //#3 - clear the last version validated if the versions are different
    this.clearLastVersionValidated();

    //#4 - check if the versions are equal
    const areVersionsEquals = response.version === frontVersion.version;

    //#5 - if the versions are equal, request update front version
    if (areVersionsEquals) this.requeestUpdateFrontVersion();

    //#6 - save the last version validated
    this.saveLastVersionValidated(response.version);
  }

  saveLastVersionValidated(version: string) {
    localStorage.setItem('lastVersionValidated', version);
  }

  getLastVersionValidated() {
    return localStorage.getItem('lastVersionValidated');
  }

  clearLastVersionValidated() {
    localStorage.removeItem('lastVersionValidated');
  }

  requeestUpdateFrontVersion() {
    alert('A new version is available, please update the application');
  }
}
