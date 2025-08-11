import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-filters-action-buttons',
  standalone: true,
  imports: [FormsModule, ButtonModule, InputTextModule],
  templateUrl: './filters-action-buttons.component.html'
})
export class FiltersActionButtonsComponent {
  @Input() applyLabel = 'Apply Filters';
  @Input() badge?: string | number;
  @Input() showOverlayDot = false;

  @Input() showClear = true;

  @Input() showViewToggleButtons = false;
  @Input() isTableView = false;

  @Input() showConfigButton = false;

  @Output() apply = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();
  @Output() tableView = new EventEmitter<void>();
  @Output() cardView = new EventEmitter<void>();
  @Output() config = new EventEmitter<void>();
}
