import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-table-filters-sidebar',
  standalone: true,
  imports: [FormsModule, MultiSelectModule, ButtonModule],
  templateUrl: './table-filters-sidebar.component.html',
  styleUrl: './table-filters-sidebar.component.scss'
})
export class TableFiltersSidebarComponent {}
