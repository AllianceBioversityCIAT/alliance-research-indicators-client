import { Component, inject, signal, WritableSignal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RadioButtonComponent } from '../../../../../../shared/components/custom-fields/radio-button/radio-button.component';
import { PatchGeographicScope } from '../../../../../../shared/interfaces/patch-geo-scope.interface';
import { ApiService } from '../../../../../../shared/services/api.service';

@Component({
  selector: 'app-geographic-scope',
  standalone: true,
  imports: [ButtonModule, RadioButtonComponent],
  templateUrl: './geographic-scope.component.html',
  styleUrl: './geographic-scope.component.scss'
})
export default class GeographicScopeComponent {
  api = inject(ApiService);
  body: WritableSignal<PatchGeographicScope> = signal({ geographic_focus: '' });
  geographicFocus: WritableSignal<{ list: { value: string; label: string }[]; loading: boolean }> = signal({
    list: [
      { value: 'global', label: 'Global' },
      { value: 'regional', label: 'Regional' },
      { value: 'country', label: 'Country' },
      { value: 'sub-national', label: 'Sub-national' },
      { value: 'yet-to-be-determined', label: 'This is yet to be determined' }
    ],
    loading: false
  });
}
