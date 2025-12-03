import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-search-export-controls',
  standalone: true,
  imports: [FormsModule, ButtonModule, InputTextModule],
  templateUrl: './search-export-controls.component.html'
})
export class SearchExportControlsComponent {

  @Input() applyLabel = 'Apply Filters';
  @Input() badge?: string | number;
  @Input() showOverlayDot = false;
  @Input() showClear = true;
  @Input() searchValue = '';
  @Input() searchPlaceholder = 'Find a result by code, title or creator';


  @Output() apply = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();
  @Output() searchChange = new EventEmitter<Event>();
}
