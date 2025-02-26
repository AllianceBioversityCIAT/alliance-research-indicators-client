import { Injectable, inject } from '@angular/core';
import { ClarityService } from './clarity.service';
import { CacheService } from './cache/cache.service';
import { GoogleAnalyticsService } from './google-analytics.service';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavigationEnd } from '@angular/router';
import { HotjarService } from './hotjar.service';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class TrackingToolsService {
  cache = inject(CacheService);
  clarity = inject(ClarityService);
  hotjar = inject(HotjarService);
  googleAnalytics = inject(GoogleAnalyticsService);
  private router = inject(Router);

  init() {
    this.initAllTools();
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.cache.currentUrlPath.set(event.urlAfterRedirects);
      this.updateAllTools(event.urlAfterRedirects);
    });
  }

  initAllTools() {
    if (!environment.production) return;
    this.clarity.init();
    this.googleAnalytics.init();
    this.hotjar.init();
  }

  updateAllTools(url: string) {
    if (!environment.production) return;
    this.hotjar.updateState(url);
    this.clarity.updateState(url);
    this.googleAnalytics.updateState(url);
  }
}
