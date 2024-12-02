import { Component, inject, Input, OnInit, signal } from '@angular/core';

import { Table, TableModule } from 'primeng/table';

import { InputTextModule } from 'primeng/inputtext';

import { ResultTable } from '@shared/interfaces/result/result.interface';
import { Button } from 'primeng/button';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-project-results-table',
  standalone: true,
  imports: [TableModule, InputTextModule, Button],
  templateUrl: './project-results-table.component.html',
  styleUrl: './project-results-table.component.scss'
})
export class ProjectResultsTableComponent implements OnInit {
  api = inject(ApiService);
  @Input() contractId = '';
  loading = signal(true);

  activityValues: number[] = [0, 100];

  searchValue: string | undefined;

  columns: ResultTable[] = [
    { attr: 'code', header: 'Code' },
    { attr: 'title', header: 'Title' },
    { attr: 'indicator', header: 'Indicator' },
    { attr: 'status', header: 'Status' },
    { attr: 'year', header: 'Year' },
    { attr: 'creator', header: 'Creator' },
    { attr: 'creation_date', header: 'Creation Date' }
  ];

  results() {
    return [
      {
        code: 100,
        title: 'Implementing precision agriculture techniques to optimize water usage in arid climates',
        indicator: 'Innovation use',
        status: 'EDITING',
        year: 2024,
        creator: 'Kofi Mensah',
        creation_date: '10/08/2024'
      },
      {
        code: 99,
        title: 'Strategies for enhancing soil fertility and crop yield in lands',
        indicator: 'Policy change',
        status: 'EDITING',
        year: 2024,
        creator: 'Isabelle Dubois',
        creation_date: '04/08/2024'
      },
      {
        code: 98,
        title: 'The impact of climate change on migration patterns and agricultural livelihoods',
        indicator: 'OICR',
        status: 'SUBMITTED',
        year: 2024,
        creator: 'Gabriela Santos',
        creation_date: '29/07/2024'
      },
      {
        code: 97,
        title: 'Exploring the economic and environmental benefits of agroecology in farming',
        indicator: 'Innovation use',
        status: 'ACCEPTED',
        year: 2024,
        creator: 'Juan Carlos López',
        creation_date: '24/07/2024'
      },
      {
        code: 96,
        title: 'Innovations in climate-resilient crops for food security in vulnerable areas',
        indicator: 'Innovation use',
        status: 'SUBMITTED',
        year: 2024,
        creator: 'Zainab Abubakar',
        creation_date: '18/07/2024'
      }
    ];
  }

  ngOnInit() {
    this.getData();
  }

  async getData() {
    this.loading.set(true);
    const response = await this.api.GET_ResultsByContractId(this.contractId);
    // console.log(response.data);
    this.loading.set(false);
  }

  clear(table: Table) {
    table.clear();
    this.searchValue = '';
  }

  getSeverity(status: string) {
    switch (status) {
      case 'EDITING':
        return 'danger';

      case 'SUBMMITED':
        return 'negotiation';

      case 'ACCEPT':
        return 'success';

      case 'renewal':
    }
    return null;
  }
}
