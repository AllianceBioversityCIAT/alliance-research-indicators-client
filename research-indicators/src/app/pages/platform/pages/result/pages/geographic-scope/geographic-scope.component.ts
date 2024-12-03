import { Component, inject, signal, WritableSignal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RadioButtonComponent } from '../../../../../../shared/components/custom-fields/radio-button/radio-button.component';

@Component({
  selector: 'app-geographic-scope',
  standalone: true,
  imports: [ButtonModule, RadioButtonComponent],
  templateUrl: './geographic-scope.component.html',
  styleUrl: './geographic-scope.component.scss'
})
export default class GeographicScopeComponent {
  geographicFocus = {
    options: [
      { value: 'global', label: 'Global' },
      { value: 'regional', label: 'Regional' },
      { value: 'country', label: 'Country' },
      { value: 'sub-national', label: 'Sub-national' },
      { value: 'yet-to-be-determined', label: 'This is yet to be determined' }
    ]
  };
}
