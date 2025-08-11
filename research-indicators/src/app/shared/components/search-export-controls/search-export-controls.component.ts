import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-search-export-controls',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule],
  template: `
    <div class="flex gap-3 items-center">
      @if (showExportButton) {
        <p-button
          icon="pi pi-file-excel !text-[12px]"
          styleClass="!rounded-[8px] !text-[12px] !max-h-[27px] !py-1"
          (keydown.enter)="export.emit()"
          (click)="export.emit()"
          [label]="exportLabel"
          class="p-button-outlined"
          [outlined]="true"></p-button>
      }

      <div class="relative w-[25rem]">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <i class="pi pi-search text-[#6B7280] !text-[12px]"></i>
        </span>
        <input
          pInputText
          type="text"
          [ngModel]="searchValue"
          (input)="searchChange.emit($event)"
          [placeholder]="searchPlaceholder"
          class="w-full !pl-9 !rounded-[8px] py-2 border !max-h-[27px] !text-[12px] !py-1 !border-[#B9C0C5] !text-[#6B7280] rounded-lg" />
      </div>
    </div>
  `
})
export class SearchExportControlsComponent {
  @Input() showExportButton = true;
  @Input() exportLabel = 'Export Results';
  @Input() searchValue = '';
  @Input() searchPlaceholder = 'Find a result by code, title or creator';

  @Output() export = new EventEmitter<void>();
  @Output() searchChange = new EventEmitter<Event>();
}
