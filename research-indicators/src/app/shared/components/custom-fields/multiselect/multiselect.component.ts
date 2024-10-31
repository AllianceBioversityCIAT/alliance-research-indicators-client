import { Component, Input, signal } from '@angular/core';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-multiselect',
  standalone: true,
  imports: [MultiSelectModule],
  templateUrl: './multiselect.component.html',
  styleUrl: './multiselect.component.scss'
})
export class MultiselectComponent {
  @Input() signal = signal([]);
  @Input() signalOptionValue = '';
  @Input() selectedOptions: any[] = [];
  @Input() options: any[] = [];
  @Input() service: any;

  // selectedArray =  any[]
}
