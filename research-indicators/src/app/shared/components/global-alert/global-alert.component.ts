import { Component, computed, inject } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ActionsService } from '../../services/actions.service';
import { ButtonModule } from 'primeng/button';
import { GlobalAlert } from '@shared/interfaces/global-alert.interface';

@Component({
  selector: 'app-global-alert',
  imports: [ButtonModule],
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
export class GlobalAlertComponent {
  actions = inject(ActionsService);
  alertList = computed(() => {
    const list = this.actions.globalAlertsStatus().map((alert: GlobalAlert) => {
      alert.icon = this.getIcon(alert.severity).icon;
      alert.color = this.getIcon(alert.severity).color;
      if (!alert.cancelCallback?.label) alert.cancelCallback = { label: 'Cancel' };
      return alert;
    });
    return list;
  });

  closeAlert(index: number) {
    this.actions.hideGlobalAlert(index);
  }

  getIcon(severity: 'success' | 'info' | 'warning' | 'error' | 'secondary' | 'contrast'): { icon: string; color: string } {
    switch (severity) {
      case 'success':
        return { icon: 'status-icons/success.png', color: '#509C55' };
      case 'warning':
        return { icon: 'status-icons/warning.png', color: '#E69F00' };
      case 'error':
        return { icon: 'cancel', color: 'red' };
      default:
        return { icon: 'info', color: 'blue' };
    }
  }
}
