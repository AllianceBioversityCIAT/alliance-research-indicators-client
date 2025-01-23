/* eslint-disable @typescript-eslint/no-explicit-any */

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '@shared/services/api.service';
import { ServiceLocatorService } from '@shared/services/service-locator.service';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-search-a-result',
  standalone: true,
  imports: [CommonModule, ButtonModule, PaginatorModule],
  templateUrl: './search-a-result.component.html',
  styleUrl: './search-a-result.component.scss'
})
export default class SearchAResultComponent implements OnInit {
  api = inject(ApiService);
  serviceLocator = inject(ServiceLocatorService);
  service: any;
  first = signal(0);
  rows = signal(10);

  ngOnInit() {
    this.service = this.serviceLocator.getService('openSearchResult');
  }
}
