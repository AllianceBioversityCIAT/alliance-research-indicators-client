import { Component, computed, inject, signal } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ActionsService } from '../../services/actions.service';
import { ButtonModule } from 'primeng/button';
import { GlobalAlert } from '@shared/interfaces/global-alert.interface';
import { InputComponent } from '../custom-fields/input/input.component';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ServiceLocatorService } from '@shared/services/service-locator.service';
import { GetYear } from '@shared/interfaces/get-year.interface';
interface ListService {
  list(): GetYear[];
}

@Component({
  selector: 'app-global-alert',
  imports: [ButtonModule, InputComponent, FormsModule, SelectModule],
  templateUrl: './global-alert.component.html',
  standalone: true,
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
  service?: ListService;
  optionsList: GetYear[] = [];
  selectedTemp = null;
  showReportedWarning = false;

  body = signal<{ commentValue: string; selectValue: number | string | null }>({
    commentValue: '',
    selectValue: null
  });

  constructor(private readonly serviceLocator: ServiceLocatorService) {}

  alertList = computed(() => {
    const list = this.actions.globalAlertsStatus().map((alert: GlobalAlert) => {
      alert.icon = this.getIcon(alert.severity).icon;
      alert.color = this.getIcon(alert.severity).color;
      alert.buttonColor = this.getIcon(alert.severity).buttonColor;
      if (alert.serviceName) {
        const foundService = this.serviceLocator.getService(alert.serviceName);
        this.service = foundService === null ? undefined : (foundService as unknown as ListService);
        this.optionsList = this.service ? this.service.list() : [];
      } else {
        this.service = undefined;
      }

      if (alert.commentLabel) {
        alert.commentLabel = alert.commentRequired ? alert.commentLabel : `${alert.commentLabel} (Optional)`;
      }
      if (!alert.cancelCallback?.label) alert.cancelCallback = { label: 'Cancel' };
      return alert;
    });
    return list;
  });

  get isInvalid(): boolean {
    return !this.body()?.selectValue;
  }
  closeAlert(index: number) {
    this.actions.hideGlobalAlert(index);
    this.body.update(body => ({ ...body, commentValue: '', selectValue: null }));
  }

  getIcon(severity: 'success' | 'info' | 'warning' | 'error' | 'secondary' | 'contrast' | 'confirm'): {
    icon: string;
    color: string;
    buttonColor?: string;
  } {
    switch (severity) {
      case 'success':
        return { icon: 'pi pi-check-circle', color: '#509C55' };
      case 'confirm':
        return { icon: 'pi pi-pencil', color: '#509C55' };
      case 'warning':
        return { icon: 'pi pi-history', color: '#E69F00', buttonColor: '#E69F00' };
      case 'secondary':
        return { icon: 'pi pi-exclamation-triangle', color: '#E69F00', buttonColor: '#E69F00' };
      case 'error':
        return { icon: 'pi pi-times-circle', color: 'red' };
      default:
        return { icon: 'info', color: 'blue' };
    }
  }

  onSelectChange(selectedValue: number | string) {
    const selectedObj = this.optionsList.find(x => x.report_year === selectedValue);
    if (selectedObj?.has_reported === 1) {
      this.showReportedWarning = true;
    } else {
      this.showReportedWarning = false;
      this.body.update(b => ({ ...b, selectValue: selectedValue }));
    }
  }
}
