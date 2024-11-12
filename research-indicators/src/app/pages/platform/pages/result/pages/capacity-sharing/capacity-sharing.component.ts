import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { GetCapSharingService } from '../../../../../../shared/services/control-list/get-cap-sharing.service';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RadioButtonComponent } from '../../../../../../shared/components/custom-fields/radio-button/radio-button.component';
import { ApiService } from '../../../../../../shared/services/api.service';
import { ActionsService } from '../../../../../../shared/services/actions.service';

@Component({
  selector: 'app-capacity-sharing',
  standalone: true,
  imports: [ButtonModule, FormsModule, DropdownModule, CalendarModule, RadioButtonModule, RadioButtonComponent],
  templateUrl: './capacity-sharing.component.html',
  styleUrl: './capacity-sharing.component.scss'
})
export default class CapacitySharingComponent {
  getCapSharingService = inject(GetCapSharingService);
  api = inject(ApiService);
  actions = inject(ActionsService);
  body: WritableSignal<any> = signal({});

  constructor() {
    this.getData();
  }

  async getData() {
    const response = await this.api.GET_CapacitySharing();
    console.log(response);
    this.body.set(response.data);
    console.log(this.body());
  }

  async saveData() {
    console.log(this.body());
    const response = await this.api.PATCH_CapacitySharing(this.body());
    console.log(response);
    this.actions.showToast({ severity: 'success', summary: 'Capacity Sharing', detail: 'Data saved successfully' });
  }
}
