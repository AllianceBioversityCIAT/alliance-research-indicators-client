import { ChangeDetectionStrategy, Component, computed, ContentChild, effect, inject, Input, signal, TemplateRef, WritableSignal, OnInit } from '@angular/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { GetLeversService } from '../../../services/control-list/get-levers.service';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { GetContractsService } from '../../../services/control-list/get-contracts.service';
import { ActionsService } from '../../../services/actions.service';

@Component({
  selector: 'app-multiselect',
  standalone: true,
  imports: [MultiSelectModule, FormsModule, NgTemplateOutlet],
  templateUrl: './multiselect.component.html',
  styleUrl: './multiselect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiselectComponent implements OnInit {
  getLeversService = inject(GetLeversService);
  getContractsService = inject(GetContractsService);
  actions = inject(ActionsService);
  @ContentChild('rows') rows!: TemplateRef<any>;
  @Input() signal: WritableSignal<any> = signal({});
  @Input() optionLabel = '';
  @Input() optionValue = '';
  @Input() signalOptionValue = '';
  @Input() serviceName: 'levers' | 'contracts' | '' = '';

  service: GetLeversService | GetContractsService | null = null;

  selectedOptions = computed(() => {
    return { data: this.objectArrayToIdArray(this.signal()[this.signalOptionValue], this.optionValue) || [] };
  });
  firstLoad = signal(true);

  onChange = effect(
    () => {
      const hasNoLabelList = this.signal()[this.signalOptionValue].filter((item: any) => !Object.prototype.hasOwnProperty.call(item, this.optionLabel));
      if (hasNoLabelList.length && this.firstLoad() && this.service?.list().length) {
        this.signal.update((current: any) => {
          return {
            ...current,
            [this.signalOptionValue]: current[this.signalOptionValue].map((item: any) => {
              const itemFound = this.service?.list().find((option: any) => option[this.optionValue] === item[this.optionValue]);
              return { ...item, ...itemFound };
            })
          };
        });
        this.firstLoad.set(false);
      }
    },
    { allowSignalWrites: true }
  );

  ngOnInit(): void {
    switch (this.serviceName) {
      case 'levers':
        this.service = this.getLeversService;
        break;
      case 'contracts':
        this.service = this.getContractsService;
        break;
      default:
        this.service = null;
    }
  }

  onClickItem(event: any) {
    this.signal.update((current: any) => {
      return { ...current, [this.signalOptionValue]: this.service?.list().filter((option: any) => event.includes(option[this.optionValue])) };
    });
  }

  objectArrayToIdArray(array: any[], attribute: string) {
    return array.map((item: any) => item[attribute]);
  }

  removeOption(option: any) {
    this.signal.update((current: any) => {
      return { ...current, [this.signalOptionValue]: current[this.signalOptionValue].filter((item: any) => item[this.optionValue] !== option[this.optionValue]) };
    });
  }
}
