import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { environment } from '../environments/environment';
import { jWtInterceptor } from './shared/interceptors/jwt.interceptor';
import { httpErrorInterceptor } from './shared/interceptors/http-error.interceptor';
import { ClarityService } from './shared/services/clarity.service';
import { provideServiceWorker } from '@angular/service-worker';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { ROARPreset } from './theme/roartheme';
const config: SocketIoConfig = { url: environment.webSocketServerUrl, options: {} };

function initializeClarityService(clarityService: ClarityService) {
  return () => clarityService.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([jWtInterceptor, httpErrorInterceptor])),
    importProvidersFrom(BrowserModule, BrowserAnimationsModule, SocketIoModule.forRoot(config)),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: ROARPreset,
        options: {
          darkModeSelector: '.dark-mode'
        }
      }
    }),
    ClarityService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeClarityService,
      deps: [ClarityService],
      multi: true
    },
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};
