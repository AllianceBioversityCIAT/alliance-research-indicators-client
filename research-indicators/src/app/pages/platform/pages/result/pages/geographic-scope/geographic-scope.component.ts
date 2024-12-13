import { Component, inject, signal, WritableSignal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RadioButtonComponent } from '../../../../../../shared/components/custom-fields/radio-button/radio-button.component';
import { ApiService } from '../../../../../../shared/services/api.service';
import { MultiselectComponent } from '../../../../../../shared/components/custom-fields/multiselect/multiselect.component';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { GetGeoLocation } from '../../../../../../shared/interfaces/get-geo-location.interface';

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

  constructor() {
    this.getData();
  }

  async getData() {
    const response = await this.api.GET_GeoLocation(this.cache.currentResultId());
    this.body.set(response.data);
  }

  async saveData() {
    const response = await this.api.PATCH_GeoLocation(this.cache.currentResultId(), this.body());
  }
}
