import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RadioButtonComponent } from '../../../../../../shared/components/custom-fields/radio-button/radio-button.component';
import { ApiService } from '../../../../../../shared/services/api.service';
import { MultiselectComponent } from '../../../../../../shared/components/custom-fields/multiselect/multiselect.component';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { GetGeoLocation } from '../../../../../../shared/interfaces/get-geo-location.interface';
import { ActionsService } from '../../../../../../shared/services/actions.service';

@Component({
  selector: 'app-geographic-scope',
  standalone: true,
  imports: [ButtonModule, RadioButtonComponent, MultiselectComponent],
  templateUrl: './geographic-scope.component.html',
  styleUrl: './geographic-scope.component.scss'
})
export default class GeographicScopeComponent {
  api = inject(ApiService);
  body: WritableSignal<GetGeoLocation> = signal({});
  cache = inject(CacheService);
  actions = inject(ActionsService);

  constructor() {
    this.getData();
  }

  getMultiselectLabel = computed(() => {
    let country = '';
    let region = '';
    switch (Number(this.body().geo_scope_id)) {
      case 1:
        country = 'Are there any regions that you wish to specify for this Impact?';
        region = 'Are there any countries that you wish to specify for this Impact?';
        break;
      case 2:
        country = '';
        region = 'Select the regions';
        break;
      case 4:
        country = 'Select the countries';
        region = '';
        break;
      case 5:
        country = 'Select the countries';
        region = '';
        break;
      default:
        break;
    }
    return { country, region };
  });

  async getData() {
    const response = await this.api.GET_GeoLocation(this.cache.currentResultId());
    this.body.set(response.data);
    console.log(this.body());
  }

  async saveData() {
    console.log(this.body());
    const response = await this.api.PATCH_GeoLocation(this.cache.currentResultId(), this.body());
    if (!response.successfulRequest) return;
    this.getData();
    this.actions.showToast({ severity: 'success', summary: 'Geographic Scope', detail: 'Data saved successfully' });
  }
}
