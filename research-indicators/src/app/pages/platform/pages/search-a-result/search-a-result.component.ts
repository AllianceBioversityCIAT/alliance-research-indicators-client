/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, inject, OnInit } from '@angular/core';
import { ApiService } from '@shared/services/api.service';
import { ServiceLocatorService } from '@shared/services/service-locator.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-search-a-result',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './search-a-result.component.html',
  styleUrl: './search-a-result.component.scss'
})
export default class SearchAResultComponent implements OnInit {
  api = inject(ApiService);
  serviceLocator = inject(ServiceLocatorService);
  service: any;

  ngOnInit() {
    this.service = this.serviceLocator.getService('openSearchResult');
  }
}
