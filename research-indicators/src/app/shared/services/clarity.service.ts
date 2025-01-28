import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import clarity from '@microsoft/clarity';
import { environment } from '../../../environments/environment';
import { CacheService } from './cache/cache.service';

@Injectable({
  providedIn: 'root'
})
export class ClarityService {
  private router = inject(Router);
  private cache = inject(CacheService);
  private readonly CLARITY_PROJECT_ID = environment.clarityProjectId;
  private initialized = false;

  public init(): void {
    if (this.initialized) return;

    try {
      this.initClarity();
      this.setupRouteTracking();
      this.setUserInfo();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Clarity:', error);
    }
  }

  private initClarity(): void {
    try {
      clarity.init(this.CLARITY_PROJECT_ID);
      clarity.consent(); // Enable cookie consent by default
    } catch (error) {
      console.error('Error initializing Clarity:', error);
      throw error;
    }
  }

  private setupRouteTracking(): void {
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe({
      next: (event: NavigationEnd) => {
        try {
          clarity.setTag('page', event.urlAfterRedirects);
        } catch (error) {
          console.error('Error tracking page view:', error);
        }
      },
      error: error => console.error('Error in route tracking subscription:', error)
    });
  }

  private setUserInfo(): void {
    try {
      if (this.cache.dataCache()?.user) {
        const user = this.cache.dataCache().user;
        clarity.setTag('user_id', `${user.first_name} ${user.last_name}`);
        clarity.setTag('user_email', user.email || '');
        clarity.setTag('user_role', user.roleName || '');
      }
    } catch (error) {
      console.error('Error setting user info:', error);
    }
  }

  // Método público para actualizar la información del usuario
  public updateUserInfo(): void {
    this.setUserInfo();
  }

  /**
   * Track custom events
   * @param name Event name
   * @param data Optional event data
   */
  public trackEvent(name: string, data?: Record<string, unknown>): void {
    try {
      clarity.event(name);
      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          clarity.setTag(key, String(value));
        });
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  /**
   * Set custom tags
   * @param tags Key-value pairs of tags
   */
  public setTags(tags: Record<string, string>): void {
    try {
      Object.entries(tags).forEach(([key, value]) => {
        clarity.setTag(key, value);
      });
    } catch (error) {
      console.error('Error setting tags:', error);
    }
  }

  /**
   * Upgrade a session for priority
   * @param reason Reason for upgrading the session
   */
  public upgradeSession(reason: string): void {
    try {
      clarity.upgrade(reason);
    } catch (error) {
      console.error('Error upgrading session:', error);
    }
  }

  /**
   * Set cookie consent status
   * @param hasConsent Whether the user has given consent
   */
  public setCookieConsent(hasConsent: boolean): void {
    try {
      clarity.consent(hasConsent);
    } catch (error) {
      console.error('Error setting cookie consent:', error);
    }
  }
}
