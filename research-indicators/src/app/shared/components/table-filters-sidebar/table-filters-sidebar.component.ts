import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';

interface Option {
  name: string;
}

@Component({
  selector: 'app-table-filters-sidebar',
  standalone: true,
  imports: [FormsModule, MultiSelectModule],
  templateUrl: './table-filters-sidebar.component.html',
  styleUrl: './table-filters-sidebar.component.scss'
})
export class TableFiltersSidebarComponent implements OnInit {
  options!: Option[];

  value1 = [];
  value2 = [];
  value3 = [];

  selectedOptions!: Option[];

  ngOnInit() {
    this.options = [
      { name: 'Capacity Sharing for Development' },
      { name: 'Innovation Development' },
      { name: 'Innovation Use' },
      { name: 'Knowledge Product' },
      { name: 'OICR' },
      { name: 'Policy Change' }
    ];
  }
}
