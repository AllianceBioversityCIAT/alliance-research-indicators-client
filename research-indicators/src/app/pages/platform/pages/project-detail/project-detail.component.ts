import { Component, inject, OnInit, signal } from '@angular/core';
import { ResultsCenterTableComponent } from '../results-center/components/results-center-table/results-center-table.component';
import { TableFiltersSidebarComponent } from '../results-center/components/table-filters-sidebar/table-filters-sidebar.component';
import { TableConfigurationComponent } from '../results-center/components/table-configuration/table-configuration.component';
import { SectionSidebarComponent } from '@shared/components/section-sidebar/section-sidebar.component';
import { ProjectItemComponent } from '@shared/components/project-item/project-item.component';
import { ApiService } from '../../../../shared/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { GetProjectDetail, GetProjectDetailIndicator } from '../../../../shared/interfaces/get-project-detail.interface';
import { ResultsCenterService } from '../results-center/results-center.service';

@Component({
  selector: 'app-project-detail',
  imports: [ResultsCenterTableComponent, ProjectItemComponent, TableFiltersSidebarComponent, TableConfigurationComponent, SectionSidebarComponent],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss'
})
export default class ProjectDetailComponent implements OnInit {
  activatedRoute = inject(ActivatedRoute);
  api = inject(ApiService);
  resultsCenterService = inject(ResultsCenterService);
  contractId = signal('');
  currentProject = signal<GetProjectDetail>({});

  ngOnInit(): void {
    this.contractId.set(this.activatedRoute.snapshot.params['id']);
    this.resultsCenterService.primaryContractId.set(this.contractId());
    this.resultsCenterService.resetState();
    this.resultsCenterService.main();
    this.getProjectDetail();
  }

  async getProjectDetail() {
    const response = await this.api.GET_ResultsCount(this.contractId());
    if (response?.data?.indicators) {
      response.data.indicators.forEach((indicator: GetProjectDetailIndicator) => {
        indicator.full_name = indicator.indicator.name;
      });
      this.currentProject.set(response.data);
    } else if (response?.data) {
      this.currentProject.set(response.data);
    } else {
      this.currentProject.set(undefined as unknown as GetProjectDetail);
    }
  }

  onIndicatorClick(indicator: { indicator_id: number; name: string }): void {
    // Limpiar otros filtros de indicadores primero
    this.resultsCenterService.tableFilters.update(prev => ({
      ...prev,
      indicators: []
    }));

    // Agregar el indicador seleccionado al filtro
    this.resultsCenterService.tableFilters.update(prev => ({
      ...prev,
      indicators: [{ indicator_id: indicator.indicator_id, name: indicator.name }]
    }));

    // Aplicar los filtros
    this.resultsCenterService.applyFilters();
  }
}
