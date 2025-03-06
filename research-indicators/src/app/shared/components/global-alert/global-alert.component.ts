import { Component, computed, inject, signal } from '@angular/core';
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
export class GlobalAlertComponent {
  actions = inject(ActionsService);
  body = signal({
    commentValue: ''
  });
  alertList = computed(() => {
    const list = this.actions.globalAlertsStatus().map((alert: GlobalAlert) => {
      alert.icon = this.getIcon(alert.severity).icon;
      alert.color = this.getIcon(alert.severity).color;
      alert.buttonColor = this.getIcon(alert.severity).buttonColor;
      alert.commentLabel = alert.commentRequired ? alert.commentLabel : `${alert.commentLabel} (optional)`;
      if (!alert.cancelCallback?.label) alert.cancelCallback = { label: 'Cancel' };
      return alert;
    });
    return list;
  });

  closeAlert(index: number) {
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
