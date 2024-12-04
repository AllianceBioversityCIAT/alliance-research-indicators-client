import { Component, inject, signal, WritableSignal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RadioButtonComponent } from '../../../../../../shared/components/custom-fields/radio-button/radio-button.component';
import { PatchGeographicScope } from '../../../../../../shared/interfaces/patch-geo-scope.interface';
import { ApiService } from '../../../../../../shared/services/api.service';
import { MultiselectComponent } from '../../../../../../shared/components/custom-fields/multiselect/multiselect.component';

@Component({
  selector: 'app-geographic-scope',
  standalone: true,
  imports: [ButtonModule, RadioButtonComponent, MultiselectComponent],
  templateUrl: './geographic-scope.component.html',
  styleUrl: './geographic-scope.component.scss'
})
export default class GeographicScopeComponent {
  api = inject(ApiService);
  body: WritableSignal<PatchGeographicScope> = signal({ geographic_focus: '' });
}
