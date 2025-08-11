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
  @Input() showExportButton = true;
  @Input() exportLabel = 'Export Results';
  @Input() searchValue = '';
  @Input() searchPlaceholder = 'Find a result by code, title or creator';

  @Output() export = new EventEmitter<void>();
  @Output() searchChange = new EventEmitter<Event>();
}
