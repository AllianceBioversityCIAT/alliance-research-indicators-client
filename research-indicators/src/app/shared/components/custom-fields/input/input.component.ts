/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, Input, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SaveOnWritingDirective } from '../../../directives/save-on-writing.directive';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule, InputTextModule, SaveOnWritingDirective],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss'
})
export class InputComponent {
  @Input() signal: WritableSignal<any> = signal({});
  @Input() optionValue = '';
}
