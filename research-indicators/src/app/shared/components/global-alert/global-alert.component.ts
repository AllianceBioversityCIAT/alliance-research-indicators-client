import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ActionsService } from '../../services/actions.service';
import { ButtonModule } from 'primeng/button';
import { GlobalAlert } from '@shared/interfaces/global-alert.interface';
import { InputComponent } from '../custom-fields/input/input.component';

@Component({
  selector: 'app-global-alert',
  imports: [ButtonModule, InputComponent],
  templateUrl: './global-alert.component.html',
  styleUrls: ['./global-alert.component.scss'],
  animations: [
    trigger('alertAnimation', [
      state('information', style({ opacity: 1 })),
      state('warning', style({ opacity: 1 })),
      state('error', style({ opacity: 1 })),
      transition('void => information', [style({ opacity: 0 }), animate('300ms ease-in')]),
      transition('void => warning', [style({ opacity: 0 }), animate('300ms ease-in')]),
      transition('void => error', [style({ opacity: 0 }), animate('300ms ease-in')])
    ])
  ]
})
export class GlobalAlertComponent implements OnInit, OnDestroy {
  actions = inject(ActionsService);
  body = signal({
    commentValue: ''
  });
  private autoHideTimeouts: number[] = [];

  alertList = computed(() => {
    const list = this.actions.globalAlertsStatus().map((alert: GlobalAlert) => {
      alert.icon = this.getIcon(alert.severity).icon;
      alert.color = this.getIcon(alert.severity).color;
      alert.buttonColor = this.getIcon(alert.severity).buttonColor;

      if (alert.commentLabel) {
        alert.commentLabel = alert.commentRequired ? alert.commentLabel : `${alert.commentLabel} (Optional)`;
      }
      if (!alert.cancelCallback?.label) alert.cancelCallback = { label: 'Cancel' };
      return alert;
    });

    this.setupAutoHideForAlerts(list);

    return list;
  });

  ngOnInit(): void {
    this.setupAutoHideForAlerts(this.alertList());
  }

  ngOnDestroy(): void {
    this.clearAllTimeouts();
  }

  private setupAutoHideForAlerts(alerts: GlobalAlert[]): void {
    this.clearAllTimeouts();

    alerts.forEach((alert, index) => {
      if (alert.autoHideDuration) {
        const timeoutId = window.setTimeout(() => {
          this.closeAlert(index);
        }, alert.autoHideDuration);

        this.autoHideTimeouts[index] = timeoutId;
      }
    });
  }

  private clearAllTimeouts(): void {
    this.autoHideTimeouts.forEach(timeoutId => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    });
    this.autoHideTimeouts = [];
  }

  closeAlert(index: number) {
    if (this.autoHideTimeouts[index]) {
      window.clearTimeout(this.autoHideTimeouts[index]);
      this.autoHideTimeouts[index] = 0;
    }

    this.actions.hideGlobalAlert(index);
    this.body.update(body => ({ ...body, commentValue: '' }));
  }

  getIcon(severity: 'success' | 'info' | 'warning' | 'error' | 'secondary' | 'contrast'): { icon: string; color: string; buttonColor?: string } {
    switch (severity) {
      case 'success':
        return { icon: 'pi pi-check-circle', color: '#509C55' };
      case 'warning':
        return { icon: 'pi pi-history', color: '#E69F00', buttonColor: '#E69F00' };
      case 'error':
        return { icon: 'cancel', color: 'red' };
      default:
        return { icon: 'info', color: 'blue' };
    }
  }
}
