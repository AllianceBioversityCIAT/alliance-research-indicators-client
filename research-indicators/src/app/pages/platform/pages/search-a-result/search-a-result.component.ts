import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ApiService } from '@shared/services/api.service';
import { ServiceLocatorService } from '@shared/services/service-locator.service';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { RouterLink } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { GetOsResultService } from '../../../../shared/services/opensearch/get-os-result.service';
import { CustomProgressBarComponent } from '@shared/components/custom-progress-bar/custom-progress-bar.component';

@Component({
  selector: 'app-search-a-result',
  standalone: true,
  imports: [CommonModule, ButtonModule, PaginatorModule, RouterLink, TooltipModule, CustomProgressBarComponent],
  templateUrl: './search-a-result.component.html',
  styleUrl: './search-a-result.component.scss'
})
export default class SearchAResultComponent {
  api = inject(ApiService);
  serviceLocator = inject(ServiceLocatorService);
  getOsResultService = inject(GetOsResultService);
  first = signal(0);
  rows = signal(10);
}
