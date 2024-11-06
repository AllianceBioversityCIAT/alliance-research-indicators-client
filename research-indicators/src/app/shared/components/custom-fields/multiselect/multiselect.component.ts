import { Component, computed, ContentChild, effect, Input, signal, TemplateRef, WritableSignal } from '@angular/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { GetLeversService } from '../../../services/control-list/get-levers.service';
import { GetLevers } from '../../../interfaces/get-levers.interface';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-multiselect',
  standalone: true,
  imports: [MultiSelectModule, FormsModule, NgTemplateOutlet],
  templateUrl: './multiselect.component.html',
  styleUrl: './multiselect.component.scss'
})
export class MultiselectComponent {
  @ContentChild('rows') rows!: TemplateRef<any>;
  //signal is the body of the request
  @Input() signal: WritableSignal<any> = signal({});
  @Input() optionLabel = '';
  @Input() optionValue = '';
  @Input() signalOptionValue = '';
  selectedOptions = computed(() => {
    return { data: this.objectArrayToIdArray(this.signal()[this.signalOptionValue], this.optionValue) || [] };
  });
  @Input() options: WritableSignal<any[]> = signal([]);
  @Input() service!: GetLeversService;

  onChange = effect(
    () => {
      const hasNoLabelList = this.signal()[this.signalOptionValue].filter((item: any) => !Object.prototype.hasOwnProperty.call(item, this.optionLabel));
      if (hasNoLabelList.length) {
        this.signal.update((current: any) => {
          return { ...current, [this.signalOptionValue]: current[this.signalOptionValue].map((item: any) => (hasNoLabelList.includes(item) ? { ...item, [this.optionLabel]: this.options().find((option: any) => option[this.optionValue] === item[this.optionValue])?.[this.optionLabel] } : item)) };
        });
      }
    },
    { allowSignalWrites: true }
  );

  onClickItem(event: any) {
    this.signal.update((current: any) => {
      return { ...current, [this.signalOptionValue]: this.options().filter((option: any) => event.includes(option[this.optionValue])) };
    });
  }

  objectArrayToIdArray(array: any[], attribute: string) {
    return array.map((item: any) => item[attribute]);
  }
}
