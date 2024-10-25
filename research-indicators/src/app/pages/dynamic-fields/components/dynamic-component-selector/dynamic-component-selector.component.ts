import { Component, inject, Input } from '@angular/core';
import { DynamicComponentSelectorService } from './dynamic-component-selector.service';
import { DynamicInputComponent } from '../dynamic-input/dynamic-input.component';
import { DynamicTitleComponent } from '../dynamic-title/dynamic-title.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DynamicButtonComponent } from '../dynamic-button/dynamic-button.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dynamic-component-selector',
  standalone: true,
  imports: [DynamicInputComponent, DynamicTitleComponent, ReactiveFormsModule, DynamicButtonComponent, CommonModule],
  templateUrl: './dynamic-component-selector.component.html',
  styleUrl: './dynamic-component-selector.component.scss'
})
export class DynamicComponentSelectorComponent {
  @Input() field!: any;
  @Input() formGroup!: FormGroup;

  getNestedFormGroup(field: any): FormGroup {
    if (field.attribute && this.formGroup.get(field.attribute) instanceof FormGroup) {
      return this.formGroup.get(field.attribute) as FormGroup;
    }
    return this.formGroup;
  }
}
