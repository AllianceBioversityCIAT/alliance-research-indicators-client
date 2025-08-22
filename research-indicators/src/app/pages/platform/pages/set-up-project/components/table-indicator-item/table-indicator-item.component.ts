import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
@Component({
  selector: 'app-table-indicator-item',
  imports: [TagModule, ButtonModule, TooltipModule],
  templateUrl: './table-indicator-item.component.html',
  styleUrl: './table-indicator-item.component.scss'
})
export class TableIndicatorItemComponent {
  @Input() indicators: any[] = [];
  @Output() showAllAction: EventEmitter<void> = new EventEmitter<void>();
  showAllIndicators = signal<boolean>(false);
}
