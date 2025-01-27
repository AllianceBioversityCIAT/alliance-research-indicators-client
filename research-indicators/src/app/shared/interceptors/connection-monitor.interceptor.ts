import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ConnectionMonitorService } from '../services/connection-monitor.service';

export function connectionMonitorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const connectionMonitor = inject(ConnectionMonitorService);
  const startTime = Date.now();

  return next(req).pipe(
    tap(event => {
      if (event.type === 4) {
        // HttpEventType.Response
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        connectionMonitor.updateResponseTime(responseTime);
      }
    })
  );
}
