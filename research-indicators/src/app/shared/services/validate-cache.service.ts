import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { SwUpdate } from '@angular/service-worker';
import { ToPromiseService } from './to-promise.service';

@Injectable({
  providedIn: 'root'
})
export class ValidateCacheService {
  api = inject(ApiService);
  swUpdate = inject(SwUpdate);

  tp = inject(ToPromiseService);

  getConfiguration = () => {
    return this.tp.get(`configuration/config-front`);
  };

  saveConfiguration = (value: string) => {
    return this.tp.patch(`configuration/config-front`, { simple_value: value });
  };

  async validateVersions() {
    const response = await this.getConfiguration();
    if (response.data.simple_value === localStorage.getItem('lastVersionValidated')) return;

    if (response.data.simple_value !== localStorage.getItem('lastVersionValidated') || !localStorage.getItem('lastVersionValidated')) {
      localStorage.setItem('lastVersionValidated', response.data.simple_value);
      this.requeestUpdateFrontVersion();
    }
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
