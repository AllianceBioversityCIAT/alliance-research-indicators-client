import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { SwUpdate } from '@angular/service-worker';
import frontVersion from './../../../../public/config/version.json';

@Injectable({
  providedIn: 'root'
})
export class ValidateCacheService {
  api = inject(ApiService);
  swUpdate = inject(SwUpdate);

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
    if (!areVersionsEquals) this.requeestUpdateFrontVersion();

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

  async requeestUpdateFrontVersion() {
    try {
      console.warn('New version available, updating application...');

      // #1 - Clear all caches
      await this.clearAllCaches();

      // #2 - Update service worker if available
      await this.updateServiceWorker();

      // #3 - Force reload to apply changes
      this.forceReload();
    } catch (error) {
      console.error('Error updating front version:', error);
      // Fallback: show alert and manual reload
      alert('A new version is available, please refresh the page manually');
    }
  }

  private async clearAllCaches() {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        const deletePromises = cacheNames.map(cacheName => caches.delete(cacheName));
        await Promise.all(deletePromises);
        console.warn('All caches cleared successfully');
      } catch (error) {
        console.error('Error clearing caches:', error);
      }
    }
  }

  private async updateServiceWorker() {
    if (this.swUpdate.isEnabled) {
      try {
        // Check for updates
        const updateAvailable = await this.swUpdate.checkForUpdate();

        if (updateAvailable) {
          console.warn('Service worker update available, activating...');
          await this.swUpdate.activateUpdate();
          console.warn('Service worker updated successfully');
        } else {
          console.warn('No service worker update available');
        }
      } catch (error) {
        console.error('Error updating service worker:', error);
      }
    } else {
      console.warn('Service worker not enabled');
    }
  }

  private forceReload() {
    console.warn('Forcing page reload in 1 second...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
}
