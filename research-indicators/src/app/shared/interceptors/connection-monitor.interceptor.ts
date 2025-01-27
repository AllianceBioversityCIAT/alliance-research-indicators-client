import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ConnectionMonitorService } from '../services/connection-monitor.service';

export function connectionMonitorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const connectionMonitor = inject(ConnectionMonitorService);
  const startTime = Date.now();
  const progressInterval = setInterval(() => {
    const currentTime = Date.now();
    const currentDuration = currentTime - startTime;
    connectionMonitor.updateResponseTime(currentDuration);
  }, 1000); // Check every second

  return next(req).pipe(
    tap({
      next: event => {
        if (event.type === 4) {
          // HttpEventType.Response
          clearInterval(progressInterval);
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          connectionMonitor.updateResponseTime(responseTime);
        }
      },
      error: () => {
        clearInterval(progressInterval);
      },
      complete: () => {
        clearInterval(progressInterval);
      }
    })
  );
}
