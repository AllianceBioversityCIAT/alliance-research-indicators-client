import { Component, inject, Input, OnInit, signal, WritableSignal } from '@angular/core';

import { Table, TableModule } from 'primeng/table';

import { InputTextModule } from 'primeng/inputtext';

import { ResultTable } from '@shared/interfaces/result/result.interface';
import { Button } from 'primeng/button';
import { ApiService } from '../../services/api.service';
import { FilterByTextWithAttrPipe } from '../../pipes/filter-by-text-with-attr.pipe';
import { GetResultsByContract } from '../../interfaces/get-results-by-contract.interface';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-project-results-table',
  standalone: true,
  imports: [TableModule, InputTextModule, Button, FilterByTextWithAttrPipe, DatePipe, FilterByTextWithAttrPipe, FormsModule, RouterLink],
  templateUrl: './project-results-table.component.html',
  styleUrl: './project-results-table.component.scss'
})
export class ProjectResultsTableComponent implements OnInit {
  api = inject(ApiService);
  @Input() contractId = '';
  loading = signal(true);

  activityValues: number[] = [0, 100];

  searchValue = '';

  resultList: WritableSignal<GetResultsByContract[]> = signal([]);

  columns: ResultTable[] = [
    { attr: 'result_official_code', header: 'Code' },
    { attr: 'title', header: 'Title' },
    { attr: 'indicatorName', header: 'Indicator' },
    { attr: 'statusName', header: 'Status' },
    { attr: 'report_year_id', header: 'Year' },
    { attr: 'creatorName', header: 'Creator' },
    { attr: 'created_at', header: 'Creation Date', pipe: true }
  ];

  ngOnInit() {
    this.getData();
  }

  async getData() {
    this.loading.set(true);
    const response = await this.api.GET_ResultsByContractId(this.contractId);
    response.data.map((result: GetResultsByContract) => {
      result.full_name = `${result.result_official_code} - ${result.title} - ${result.indicator.name}`;
      result.indicatorName = result.indicator.name;
      result.statusName = result.result_status.name;
      result.creatorName = `${result.created_user.first_name} ${result.created_user.last_name}`;
    });
    this.resultList.set(response.data);
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
