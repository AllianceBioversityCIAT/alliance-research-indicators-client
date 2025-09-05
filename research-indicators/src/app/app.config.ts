import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection, isDevMode, provideAppInitializer, inject } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';

import { jWtInterceptor } from './shared/interceptors/jwt.interceptor';
import { httpErrorInterceptor } from './shared/interceptors/http-error.interceptor';
import { provideServiceWorker } from '@angular/service-worker';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { MyPreset } from './theme/roartheme';
import { TrackingToolsService } from './shared/services/tracking-tools.service';
import { resultInterceptor } from '@shared/interceptors/result.interceptor';
import { ValidateCacheService } from '@shared/services/validate-cache.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([jWtInterceptor, httpErrorInterceptor, resultInterceptor])),
    importProvidersFrom(BrowserModule, BrowserAnimationsModule),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: '.dark-mode'
        }
      }
    }),
    TrackingToolsService,

    provideAppInitializer(() => {
      const trackingToolsService = inject(TrackingToolsService);
      trackingToolsService.init();
      const validateCacheService = inject(ValidateCacheService);
      validateCacheService.validateVersions();
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};
