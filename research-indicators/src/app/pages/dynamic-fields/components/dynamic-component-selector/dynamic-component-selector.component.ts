import { Component, inject, Input } from '@angular/core';
import { DynamicComponentSelectorService } from './dynamic-component-selector.service';
import { DynamicInputComponent } from '../dynamic-input/dynamic-input.component';
import { DynamicTitleComponent } from '../dynamic-title/dynamic-title.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DynamicButtonComponent } from '../dynamic-button/dynamic-button.component';

@Component({
  selector: '[app-dynamic-component-selector]',
  standalone: true,
  imports: [DynamicInputComponent, DynamicTitleComponent, ReactiveFormsModule, DynamicButtonComponent],
  templateUrl: './dynamic-component-selector.component.html',
  styleUrl: './dynamic-component-selector.component.scss'
})
export class DynamicComponentSelectorComponent {
  dynamicSelectorSE = inject(DynamicComponentSelectorService);
  @Input() index = 0;
  @Input() fields: any[] = [];
  @Input() parent: any = {};
}
