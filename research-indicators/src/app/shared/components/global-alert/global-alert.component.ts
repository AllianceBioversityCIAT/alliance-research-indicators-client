import { Component, inject } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ActionsService } from '../../services/actions.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-global-alert',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './global-alert.component.html',
  styleUrls: ['./global-alert.component.scss'],
  animations: [trigger('alertAnimation', [state('information', style({ opacity: 1 })), state('warning', style({ opacity: 1 })), state('error', style({ opacity: 1 })), transition('void => information', [style({ opacity: 0 }), animate('300ms ease-in')]), transition('void => warning', [style({ opacity: 0 }), animate('300ms ease-in')]), transition('void => error', [style({ opacity: 0 }), animate('300ms ease-in')])])]
})
export class GlobalAlertComponent {
  actions = inject(ActionsService);

  closeAlert(index: number) {
    this.actions.hideGlobalAlert(index);
  }

  getIcon(severity: 'success' | 'info' | 'warning' | 'error' | 'secondary' | 'contrast') {
    switch (severity) {
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'error':
        return 'cancel';
      default:
        return 'info';
    }
  }
}
