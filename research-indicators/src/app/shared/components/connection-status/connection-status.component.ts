import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectionMonitorService } from '../../services/connection-monitor.service';

@Component({
  selector: 'app-connection-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="connection-status" *ngIf="shouldShowStatus()">
      <div class="status-indicator" [class]="getStatusClass()">
        <i class="material-symbols-rounded">{{ getStatusIcon() }}</i>
      </div>
      <div class="status-text">{{ getStatusText() }}</div>
    </div>
  `,
  styles: [
    `
      .connection-status {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-radius: 4px;
        background: var(--surface-card, #fff);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        position: fixed;
        top: 70px;
        right: 20px;
        z-index: 999;
        animation: fadeIn 0.3s ease-in-out;
      }

      .status-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;

        &.offline {
          background-color: #f44336;
          color: white;
        }

        &.very-slow {
          background-color: #ff9800;
          color: white;
        }

        &.slow {
          background-color: #ffd700;
          color: #333;
        }

        i {
          font-size: 16px;
          font-weight: bold;
        }
      }

      .status-text {
        font-size: 13px;
        font-weight: 500;
        color: var(--text-color, #333);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `
  ]
})
export class ConnectionStatusComponent {
  private connectionMonitor = inject(ConnectionMonitorService);

  shouldShowStatus(): boolean {
    const status = this.connectionMonitor.connectionStatus();
    return !status.isOnline || status.speed !== 'fast';
  }

  getStatusClass(): string {
    const status = this.connectionMonitor.connectionStatus();
    if (!status.isOnline) return 'offline';
    if (status.speed === 'very-slow') return 'very-slow';
    if (status.speed === 'slow') return 'slow';
    return '';
  }

  getStatusIcon(): string {
    const status = this.connectionMonitor.connectionStatus();
    if (!status.isOnline) return 'wifi_off';
    if (status.speed === 'very-slow') return 'signal_wifi_statusbar_not_connected';
    if (status.speed === 'slow') return 'wifi';
    return 'wifi';
  }

  getStatusText(): string {
    const status = this.connectionMonitor.connectionStatus();
    if (!status.isOnline) return 'No Internet Connection';
    if (status.speed === 'very-slow') return 'Very Slow Connection';
    if (status.speed === 'slow') return 'Slow Connection';
    return '';
  }
}
