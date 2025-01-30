import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-indicators-tab-filter',
  standalone: true,
  imports: [],
  templateUrl: './indicators-tab-filter.component.html',
  styleUrl: './indicators-tab-filter.component.scss'
})
export class IndicatorsTabFilterComponent {
  filters = signal([
    { filter: 'All indicators' },
    { filter: 'Capacity Sharing for Development' },
    { filter: 'Innovation Development' },
    { filter: 'Innovation Use' },
    { filter: 'Knowledge Product' },
    { filter: 'OICR' },
    { filter: 'Policy Change' }
  ]);
}
