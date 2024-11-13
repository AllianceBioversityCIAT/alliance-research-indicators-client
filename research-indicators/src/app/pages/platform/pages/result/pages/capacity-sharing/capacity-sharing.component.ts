import { Component, effect, inject, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { GetCapSharingService } from '../../../../../../shared/services/control-list/get-cap-sharing.service';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RadioButtonComponent } from '../../../../../../shared/components/custom-fields/radio-button/radio-button.component';
import { ApiService } from '../../../../../../shared/services/api.service';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { GetInstitutionsService } from '../../../../../../shared/services/control-list/get-institutions.service';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { SelectComponent } from '../../../../../../shared/components/custom-fields/select/select.component';

@Component({
  selector: 'app-capacity-sharing',
  standalone: true,
  imports: [ButtonModule, FormsModule, DropdownModule, CalendarModule, RadioButtonModule, RadioButtonComponent, SelectComponent],
  templateUrl: './capacity-sharing.component.html',
  styleUrl: './capacity-sharing.component.scss'
})
export default class CapacitySharingComponent {
  getCapSharingService = inject(GetCapSharingService);
  getInstitutionsService = inject(GetInstitutionsService);
  api = inject(ApiService);
  actions = inject(ActionsService);
  cache = inject(CacheService);
  body: WritableSignal<any> = signal({});

  constructor() {
    this.getData();
    const example: any = {
      level1: {
        a: 'Hello from level 1',
        level2: {
          a: 'Hello from level 2',
          level3: {
            a: 'Hello from level 3'
          }
        }
      }
    };
    console.log(example);
    const array = ['level1', 'level2', 'level3', 'a'];
    console.log(example['level1']['level2']['level3']['a']);
    console.log(array.reduce((acc, key) => acc && acc[key], example));
  }

  async getData() {
    this.cache.loadingCurrentResult.set(true);
    const response = await this.api.GET_CapacitySharing();
    console.log(response);
    this.body.set(response.data);
    console.log(this.body());
    this.cache.loadingCurrentResult.set(false);
    this.body.update(current => {
      current.loaded = true;
      return { ...current };
    });
  }

  async saveData() {
    console.log(this.body());
    const response = await this.api.PATCH_CapacitySharing(this.body());
    console.log(response);
    this.actions.showToast({ severity: 'success', summary: 'Capacity Sharing', detail: 'Data saved successfully' });
    this.getData();
  }

  onSaveSection = effect(() => {
    if (this.actions.saveCurrentSectionValue()) this.saveData();
  });
}
