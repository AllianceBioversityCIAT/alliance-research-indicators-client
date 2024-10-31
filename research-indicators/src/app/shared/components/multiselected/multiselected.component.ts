import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-multiselected',
  standalone: true,
  imports: [],
  templateUrl: './multiselected.component.html',
  styleUrl: './multiselected.component.scss'
})
export class MultiselectedComponent {
  @Input() options: [] = [];
  @Input() title = '';
  @Input() typeLabel = '';
  @Input() typeLabelValue = '';
  @Input() asPrimaryAttribute = '';
}
