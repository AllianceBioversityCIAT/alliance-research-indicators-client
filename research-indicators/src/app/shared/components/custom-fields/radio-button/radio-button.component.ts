import { Component, effect, inject, Input, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CacheService } from '../../../services/cache/cache.service';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-radio-button',
  standalone: true,
  imports: [RadioButtonModule, FormsModule, SkeletonModule],
  templateUrl: './radio-button.component.html',
  styleUrl: './radio-button.component.scss'
})
export class RadioButtonComponent {
  cache = inject(CacheService);
  @Input() signal: WritableSignal<any> = signal({});
  @Input() options: WritableSignal<any> = signal({});
  @Input() optionLabel = '';
  @Input() optionValue = { body: '', option: '' };
  body = signal({ value: null });
  firstTime = signal(false);
  onChange = effect(
    () => {
      if (this.signal().loaded && this.firstTime) {
        this.body.update(current => {
          current.value = this.signal()[this.optionValue.body];
          return { ...current };
        });
        this.firstTime.set(true);
      }
    },
    { allowSignalWrites: true }
  );
  showBody() {
    console.log(this.body());
  }

  changeValue(value: any) {
    this.body.set({ value: value });
    this.setNestedPropertyWithReduce(this.signal(), this.optionValue.body, value);
  }
  setNestedPropertyWithReduce(obj: any, path: string, value: any): void {
    const keys = path.split('.');

    keys.slice(0, -1).reduce((acc, key) => {
      // Crea el subobjeto si no existe
      if (!acc[key]) {
        acc[key] = {};
      }
      return acc[key];
    }, obj)[keys[keys.length - 1]] = value;
  }
}
