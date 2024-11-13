/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input, OnInit, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ControlListServices } from '../../../interfaces/services.interface';
import { ServiceLocatorService } from '../../../services/service-locator.service';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [DropdownModule, FormsModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss'
})
export class SelectComponent implements OnInit {
  @Input() signal: WritableSignal<any> = signal({});

  @Input() options: WritableSignal<any> = signal({});
  @Input() optionLabel = '';
  @Input() optionValue = { body: '', option: '' };
  @Input() serviceName: ControlListServices = '';
  service: any;
  body = signal({ value: '' });

  constructor(private serviceLocator: ServiceLocatorService) {}

  ngOnInit(): void {
    this.service = this.serviceLocator.getService(this.serviceName);
  }
}
