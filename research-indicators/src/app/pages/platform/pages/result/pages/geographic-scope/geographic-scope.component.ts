import { Component, computed, inject, OnInit, QueryList, signal, ViewChildren, WritableSignal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RadioButtonComponent } from '../../../../../../shared/components/custom-fields/radio-button/radio-button.component';
import { ApiService } from '../../../../../../shared/services/api.service';
import { MultiselectComponent } from '../../../../../../shared/components/custom-fields/multiselect/multiselect.component';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { Country, GetGeoLocation, Region } from '../../../../../../shared/interfaces/get-geo-location.interface';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { Router } from '@angular/router';
import { environment } from '../../../../../../../environments/environment';
import { MultiselectInstanceComponent } from '../../../../../../shared/components/custom-fields/multiselect-instance/multiselect-instance.component';
import { SubmissionService } from '@shared/services/submission.service';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-geographic-scope',
  imports: [ButtonModule, NgStyle, RadioButtonComponent, MultiselectComponent, MultiselectInstanceComponent],
  templateUrl: './geographic-scope.component.html'
})
export default class GeographicScopeComponent implements OnInit {
  environment = environment;
  bodyTest = signal({ value: null, valueMulti: null });
  api = inject(ApiService);
  router = inject(Router);
  body: WritableSignal<GetGeoLocation> = signal({});
  cache = inject(CacheService);
  actions = inject(ActionsService);
  loading = signal(false);
  submission = inject(SubmissionService);
  private isFirstSelect = true;
  @ViewChildren(MultiselectInstanceComponent) multiselectInstances!: QueryList<MultiselectInstanceComponent>;

  ngOnInit() {
    this.getData();
  }

  onSelect = () => {
    this.mapSignal();
    this.mapArray();
    const currentId = Number(this.body().geo_scope_id);

    if (!this.isFirstSelect && currentId === 5) {
      this.body.update(value => ({
        ...value,
        countries: []
      }));
    }

    this.isFirstSelect = false;
  };

  canRemove = (): boolean => {
    return this.submission.isEditableStatus();
  };

  isRegionsRequired = computed(() => Number(this.body().geo_scope_id) === 2);
  isCountriesRequired = computed(() => [4, 5].includes(Number(this.body().geo_scope_id)));
  isSubNationalRequired = computed(() => Number(this.body().geo_scope_id) === 5);

  showSubnationalError = computed(() => {
    const scopeId = Number(this.body().geo_scope_id);
    if (scopeId !== 5) return false;

    const countries = this.body().countries ?? [];

    return countries.some(
      country => !country.result_countries_sub_nationals_signal?.() || (country.result_countries_sub_nationals_signal()?.regions?.length ?? 0) === 0
    );
  });

  private getCountrySelectionText() {
    return {
      countryLabel: 'Select the countries',
      countryDescription:
        'The list of countries below follows the <a href="https://www.iso.org/iso-3166-country-codes.html" target="_blank">ISO 3166</a> standard'
    };
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
        countryDescription =
          'The list of countries below follows the <a href="https://www.iso.org/iso-3166-country-codes.html" target="_blank">ISO 3166</a> standard';
        regionDescription =
          'The list of regions below follows the <a href="https://unstats.un.org/unsd/methodology/m49/" target="_blank">UN (M.49)</a> standard';
        break;
      case 2:
        regionLabel = 'Select the regions';
        regionDescription =
          'The list of regions below follows the <a href="https://unstats.un.org/unsd/methodology/m49/" target="_blank">UN (M.49)</a> standard';
        break;
      case 4:
        ({ countryLabel, countryDescription } = this.getCountrySelectionText());
        break;
      case 5:
        ({ countryLabel, countryDescription } = this.getCountrySelectionText());
        break;
      default:
        break;
    }
    return { country: { label: countryLabel, description: countryDescription }, region: { label: regionLabel, description: regionDescription } };
  });

  updateCountryRegions = (isoAlpha2: string, newRegions: Region[]) => {
    this.body.update(current => {
      const country = current.countries?.find(c => c.isoAlpha2 === isoAlpha2);
      if (country) {
        country.result_countries_sub_nationals = newRegions;
      }
      return current;
    });
  };

  isArray<T>(value: unknown): value is T[] {
    return Array.isArray(value);
  }

  removeSubnationalRegion(country: Country, region: Region) {
    this.body.update(current => {
      const target = current.countries?.find(c => c.isoAlpha2 === country.isoAlpha2);
      if (target?.result_countries_sub_nationals_signal?.set) {
        const newRegions = (target.result_countries_sub_nationals_signal().regions ?? []).filter(r => r.sub_national_id !== region.sub_national_id);

        target.result_countries_sub_nationals_signal.set({ regions: newRegions });
        target.result_countries_sub_nationals = newRegions;

        // 👉 sincroniza visualmente el selector
        const instance = this.multiselectInstances.find(m => m.endpointParams?.isoAlpha2 === country.isoAlpha2);
        if (region.sub_national_id !== undefined) {
          instance?.removeRegionById(region.sub_national_id);
        }
      }

      return current;
    });
  }

  mapSignal = () => {
    this.body.update(currentBody => {
      currentBody.countries?.forEach((country: Country) => {
        const regions = Array.isArray(country.result_countries_sub_nationals) ? country.result_countries_sub_nationals : [];

        if ('result_countries_sub_nationals_signal' in country && country.result_countries_sub_nationals_signal?.set) {
          country.result_countries_sub_nationals_signal.set({ regions });
        } else {
          country.result_countries_sub_nationals_signal = signal({ regions });
        }
      });

      return currentBody;
    });
  };

  mapArray = () => {
    this.body.update(currentBody => {
      currentBody.countries?.forEach((country: Country) => {
        country.result_countries_sub_nationals = country.result_countries_sub_nationals_signal().regions ?? [];
      });
      return currentBody;
    });
  };

  async getData() {
    this.loading.set(true);
    const response = await this.api.GET_GeoLocation(this.cache.currentResultId());
    response.data.countries?.forEach(country => {
      country.result_countries_sub_nationals.forEach(subNational => {
        subNational.name = subNational.sub_national?.name ?? '';
      });
    });

    this.body.set(response.data);
    this.mapSignal();
    this.loading.set(false);
  }

  async saveData(page?: 'next' | 'back') {
    this.loading.set(true);
    if (this.submission.isEditableStatus()) {
      this.mapArray();
      const response = await this.api.PATCH_GeoLocation(this.cache.currentResultId(), this.body());
      if (!response.successfulRequest) return;
      await this.getData();
      this.actions.showToast({ severity: 'success', summary: 'Geographic Scope', detail: 'Data saved successfully' });
      if (page === 'back') this.router.navigate(['result', this.cache.currentResultId(), 'partners']);
      if (page === 'next') this.router.navigate(['result', this.cache.currentResultId(), 'evidence']);
    } else {
      if (page === 'back') this.router.navigate(['result', this.cache.currentResultId(), 'partners']);
      if (page === 'next') this.router.navigate(['result', this.cache.currentResultId(), 'evidence']);
    }
    this.loading.set(false);
  }
}
