/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-partner-selected-item',
  standalone: true,
  imports: [PartnerSelectedItemComponent],
  templateUrl: './partner-selected-item.component.html',
  styleUrl: './partner-selected-item.component.scss'
})
export class PartnerSelectedItemComponent {
  environment = environment;
  @Input() institution: any;
}
