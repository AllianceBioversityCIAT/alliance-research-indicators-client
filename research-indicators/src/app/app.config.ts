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
import { connectionMonitorInterceptor } from './shared/interceptors/connection-monitor.interceptor';
import { provideServiceWorker } from '@angular/service-worker';

const config: SocketIoConfig = { url: environment.webSocketServerUrl, options: {} };

function initializeClarityService(clarityService: ClarityService) {
  return () => clarityService.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([jWtInterceptor, httpErrorInterceptor, connectionMonitorInterceptor])),
    importProvidersFrom(BrowserModule, BrowserAnimationsModule, SocketIoModule.forRoot(config)),
    ClarityService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeClarityService,
      deps: [ClarityService],
      multi: true
    }, provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          })
  ]
};
