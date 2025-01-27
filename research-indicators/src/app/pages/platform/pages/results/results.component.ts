import { Component } from '@angular/core';
import { TableFiltersSidebarComponent } from '@shared/components/table-filters-sidebar/table-filters-sidebar.component';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [TableFiltersSidebarComponent],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss'
})
export default class ResultsComponent {}
