import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

export interface ContactPersonRow {
  id?: number;
  name?: string;
  position?: string;
  affiliation?: string;
  email?: string;
  role?: string;
}

@Component({
  selector: 'app-authors-contact-persons-table',
  standalone: true,
  imports: [TableModule, ButtonModule],
  templateUrl: './authors-contact-persons-table.component.html'
})
export class AuthorsContactPersonsTableComponent {
  @Input() rows: ContactPersonRow[] = [];
  @Output() addClicked = new EventEmitter<void>();
}


