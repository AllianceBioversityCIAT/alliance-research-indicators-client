import { Injectable, signal } from '@angular/core';

interface NetworkInformation extends EventTarget {
  effectiveType: string;
  addEventListener: (type: string, listener: EventListener) => void;
}

declare global {
  interface Navigator {
    connection?: NetworkInformation;
  }
}

export interface ConnectionStatus {
  isOnline: boolean;
  speed: 'fast' | 'slow' | 'very-slow';
  type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConnectionMonitorService {
  private readonly SLOW_THRESHOLD = 3000; // 3 seconds
  private readonly VERY_SLOW_THRESHOLD = 5000; // 5 seconds

  public connectionStatus = signal<ConnectionStatus>({
    isOnline: navigator.onLine,
    speed: 'fast',
    type: navigator.connection?.effectiveType
  });

  constructor() {
    this.initializeConnectionMonitoring();
  }

  private initializeConnectionMonitoring() {
    // Monitor online/offline status
    window.addEventListener('online', () => this.updateConnectionStatus({ isOnline: true }));
    window.addEventListener('offline', () => this.updateConnectionStatus({ isOnline: false }));

    // Monitor connection type changes if supported
    if (navigator.connection) {
      navigator.connection.addEventListener('change', () => {
        this.updateConnectionStatus({
          type: navigator.connection?.effectiveType
        });
      });
    }
  }

  public updateResponseTime(responseTime: number) {
    let speed: 'fast' | 'slow' | 'very-slow' = 'fast';

    if (responseTime > this.VERY_SLOW_THRESHOLD) {
      speed = 'very-slow';
    } else if (responseTime > this.SLOW_THRESHOLD) {
      speed = 'slow';
    }

    this.updateConnectionStatus({ speed });
  }

  private updateConnectionStatus(update: Partial<ConnectionStatus>) {
    this.connectionStatus.update(current => ({
      ...current,
      ...update
    }));
  }
}
