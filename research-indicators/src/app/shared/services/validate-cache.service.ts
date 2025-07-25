import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { SwUpdate } from '@angular/service-worker';
import { ToPromiseService } from './to-promise.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ValidateCacheService {
  api = inject(ApiService);
  swUpdate = inject(SwUpdate);

  tp = inject(ToPromiseService);

  getConfiguration = () => {
    return this.tp.get(`configuration/${environment.frontVersionKey}`, { noAuthInterceptor: true });
  };

  async validateVersions() {
    const response = await this.getConfiguration();
    if (response.data.simple_value === localStorage.getItem('lastVersionValidated')) return;
    if (response.data.simple_value !== localStorage.getItem('lastVersionValidated') || !localStorage.getItem('lastVersionValidated')) {
      localStorage.setItem('lastVersionValidated', response.data.simple_value);
      this.requeestUpdateFrontVersion();
    }
  }

  private async clearImageCaches() {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const requests = await cache.keys();
          // Delete image resources from cache (common image extensions)
          const imageRequests = requests.filter(request => {
            const url = request.url.toLowerCase();
            return (
              url.includes('.png') ||
              url.includes('.jpg') ||
              url.includes('.jpeg') ||
              url.includes('.gif') ||
              url.includes('.svg') ||
              url.includes('.webp') ||
              url.includes('.ico') ||
              url.includes('.bmp')
            );
          });
          const deletePromises = imageRequests.map(request => cache.delete(request));
          await Promise.all(deletePromises);
        }
        console.warn('Image caches cleared successfully');
      } catch (error) {
        console.error('Error clearing image caches:', error);
      }
    }
  }

  async requeestUpdateFrontVersion() {
    try {
      console.warn('New version available, updating application...');

      // #1 - Clear all caches
      await this.clearAllCaches();
      await this.clearImageCaches();
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
