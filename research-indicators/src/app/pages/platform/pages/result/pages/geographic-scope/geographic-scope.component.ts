import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RadioButtonComponent } from '../../../../../../shared/components/custom-fields/radio-button/radio-button.component';
import { ApiService } from '../../../../../../shared/services/api.service';
import { MultiselectComponent } from '../../../../../../shared/components/custom-fields/multiselect/multiselect.component';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { Country, GetGeoLocation } from '../../../../../../shared/interfaces/get-geo-location.interface';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { Router } from '@angular/router';
import { SelectComponent } from '../../../../../../shared/components/custom-fields/select/select.component';
import { environment } from '../../../../../../../environments/environment';
import { MultiselectOpensearchComponent } from '../../../../../../shared/components/custom-fields/multiselect-opensearch/multiselect-opensearch.component';

@Component({
  selector: 'app-geographic-scope',
  standalone: true,
  imports: [ButtonModule, RadioButtonComponent, MultiselectComponent, SelectComponent, MultiselectOpensearchComponent],
  templateUrl: './geographic-scope.component.html',
  styleUrl: './geographic-scope.component.scss'
})
export default class GeographicScopeComponent {
  environment = environment;
  bodyTest = signal({ value: null, valueMulti: null });
  api = inject(ApiService);
  router = inject(Router);
  body: WritableSignal<GetGeoLocation> = signal({});
  cache = inject(CacheService);
  actions = inject(ActionsService);
  loading = signal(false);

  constructor() {
    this.getData();
  }

  onSelect = () => this.mapSignal();

  getMultiselectLabel = computed(() => {
    let countryLabel = '';
    let regionLabel = '';
    let countryDescription = '';
    let regionDescription = '';
    switch (Number(this.body().geo_scope_id)) {
      case 1:
        countryLabel = 'Are there any countries that you wish to specify for this Impact?';
        regionLabel = 'Are there any regions that you wish to specify for this Impact?';
        countryDescription =
          'The list of countries below follows the <a href="https://www.iso.org/iso-3166-country-codes.html" target="_blank">ISO 3166</a> standard';
        regionDescription =
          'The list of regions below follows the <a href="https://unstats.un.org/unsd/methodology/m49/" target="_blank">UN (M.49)</a> standard';
        break;
      case 2:
        countryLabel = '';
        regionLabel = 'Select the regions';
        countryDescription = '';
        regionDescription =
          'The list of regions below follows the <a href="https://unstats.un.org/unsd/methodology/m49/" target="_blank">UN (M.49)</a> standard';
        break;
      case 4:
        countryLabel = 'Select the countries';
        regionLabel = '';
        countryDescription =
          'The list of countries below follows the <a href="https://www.iso.org/iso-3166-country-codes.html" target="_blank">ISO 3166</a> standard';
        regionDescription = '';
        break;
      case 5:
        countryLabel = 'Select the countries';
        regionLabel = '';
        countryDescription =
          'The list of countries below follows the <a href="https://www.iso.org/iso-3166-country-codes.html" target="_blank">ISO 3166</a> standard';
        regionDescription = '';
        break;
      default:
        break;
    }
    return { country: { label: countryLabel, description: countryDescription }, region: { label: regionLabel, description: regionDescription } };
  });

  mapSignal = () => {
    this.body.update(currentBody => {
      currentBody.countries?.forEach((country: Country) => {
        country.result_countries_sub_nationals_signal = signal({ regions: country.result_countries_sub_nationals || [] });
      });
      return currentBody;
    });
  };

  mapArray = () => {
    this.body.update(currentBody => {
      currentBody.countries?.forEach((country: Country) => {
        country.result_countries_sub_nationals = country.result_countries_sub_nationals_signal().regions || [];
      });
      return currentBody;
    });
  };

  async getData() {
    this.loading.set(true);
    const response = await this.api.GET_GeoLocation(this.cache.currentResultId());
    response.data.countries?.forEach(country => {
      country.result_countries_sub_nationals.forEach(subNational => {
        subNational.name = subNational.sub_national?.name || '';
      });
    });

    this.body.set(response.data);
    this.mapSignal();
    this.loading.set(false);
  }

  async saveData(page?: 'next' | 'back') {
    this.loading.set(true);
    this.mapArray();
    const response = await this.api.PATCH_GeoLocation(this.cache.currentResultId(), this.body());

    if (!response.successfulRequest) return;
    await this.getData();
    this.actions.showToast({ severity: 'success', summary: 'Geographic Scope', detail: 'Data saved successfully' });
    if (page === 'back') this.router.navigate(['result', this.cache.currentResultId(), this.cache.currentResultIndicatorSectionPath()]);
    if (page === 'next') this.router.navigate(['result', this.cache.currentResultId(), 'evidence']);
    this.loading.set(false);
  }
}
