import { Component, Input, signal } from '@angular/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { GetLeversService } from '../../../services/control-list/get-levers.service';
import { GetLevers } from '../../../interfaces/get-levers.interface';

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
  @Input() selectedOptions: [] = [];
  @Input() options: GetLevers[] = [];
  @Input() service!: GetLeversService;

  // selectedArray =  any[]
}
