import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RadioButtonComponent } from '../../../../../../shared/components/custom-fields/radio-button/radio-button.component';
import { ApiService } from '../../../../../../shared/services/api.service';
import { MultiselectComponent } from '../../../../../../shared/components/custom-fields/multiselect/multiselect.component';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { GetGeoLocation } from '../../../../../../shared/interfaces/get-geo-location.interface';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-geographic-scope',
  standalone: true,
  imports: [ButtonModule, RadioButtonComponent, MultiselectComponent],
  templateUrl: './geographic-scope.component.html',
  styleUrl: './geographic-scope.component.scss'
})
export default class GeographicScopeComponent {
  api = inject(ApiService);
  router = inject(Router);
  body: WritableSignal<GetGeoLocation> = signal({});
  cache = inject(CacheService);
  actions = inject(ActionsService);

  constructor() {
    this.getData();
  }

  getMultiselectLabel = computed(() => {
    let countryLabel = '';
    let regionLabel = '';
    let countryDescription = '';
    let regionDescription = '';
    switch (Number(this.body().geo_scope_id)) {
      case 1:
        countryLabel = 'Are there any countries that you wish to specify for this Impact?';
        regionLabel = 'Are there any regions that you wish to specify for this Impact?';
        countryDescription = 'The list of countries below follows the ISO 3166 standard';
        regionDescription = 'The list of regions below follows the UN (M.49) standard';
        break;
      case 2:
        countryLabel = '';
        regionLabel = 'Select the regions';
        countryDescription = '';
        regionDescription = 'The list of regions below follows the UN (M.49) standard';
        break;
      case 4:
        countryLabel = 'Select the countries';
        regionLabel = '';
        countryDescription = 'The list of countries below follows the ISO 3166 standard';
        regionDescription = '';
        break;
      case 5:
        countryLabel = 'Select the countries';
        regionLabel = '';
        countryDescription = 'The list of countries below follows the ISO 3166 standard';
        regionDescription = '';
        break;
      default:
        break;
    }
    return { country: { label: countryLabel, description: countryDescription }, region: { label: regionLabel, description: regionDescription } };
  });

  async getData() {
    const response = await this.api.GET_GeoLocation(this.cache.currentResultId());
    this.body.set(response.data);
  }

  async saveData(page?: 'next' | 'back') {
    const response = await this.api.PATCH_GeoLocation(this.cache.currentResultId(), this.body());
    if (!response.successfulRequest) return;
    await this.getData();
    this.actions.showToast({ severity: 'success', summary: 'Geographic Scope', detail: 'Data saved successfully' });
    if (page === 'back') this.router.navigate(['result', this.cache.currentResultId(), this.cache.currentResultIndicatorSectionPath()]);
    if (page === 'next') this.router.navigate(['result', this.cache.currentResultId(), 'evidence']);
  }
}
