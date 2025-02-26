import { Injectable, inject } from '@angular/core';
import { ClarityService } from './clarity.service';
import { CacheService } from './cache/cache.service';
import { GoogleAnalyticsService } from './google-analytics.service';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavigationEnd } from '@angular/router';
import { HotjarService } from './hotjar.service';
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
    this.clarity.init();
    this.googleAnalytics.init();
    this.hotjar.init();
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.hotjar.updateState(event.urlAfterRedirects);
      this.clarity.updateState(event.urlAfterRedirects);
      this.googleAnalytics.updateState(event.urlAfterRedirects);
    });
  }
}
