import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ProjectItemComponent } from '@shared/components/project-item/project-item.component';
import { ApiService } from '../../../../shared/services/api.service';
import { ActivatedRoute, PRIMARY_OUTLET, Router, RouterLink, RouterOutlet } from '@angular/router';
import { GetProjectDetail, GetProjectDetailIndicator } from '../../../../shared/interfaces/get-project-detail.interface';
import { TabsModule } from 'primeng/tabs';
import { CacheService } from '../../../../shared/services/cache/cache.service';
import { SplitterModule } from 'primeng/splitter';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { SetUpProjectService } from '../set-up-project/set-up-project.service';
import { ProgressDetailContentComponent } from './pages/progress-towards-indicators/components/progress-detail-content/progress-detail-content.component';
import { ResultsCenterService } from '../results-center/results-center.service';
import { ResultsCenterTableComponent } from '../results-center/components/results-center-table/results-center-table.component';
import { TableFiltersSidebarComponent } from '../results-center/components/table-filters-sidebar/table-filters-sidebar.component';
import { TableConfigurationComponent } from '../results-center/components/table-configuration/table-configuration.component';
import { SectionSidebarComponent } from '@shared/components/section-sidebar/section-sidebar.component';

interface ViewTab {
  label: string;
  route: string;
  hidden?: boolean;
}


@Component({
  selector: 'app-project-detail',
  imports: [ResultsCenterTableComponent, ProjectItemComponent, TableFiltersSidebarComponent, TableConfigurationComponent, SectionSidebarComponent, NgTemplateOutlet, RouterOutlet, RouterLink, TabsModule, SplitterModule, CommonModule, ProgressDetailContentComponent],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss'
})
export default class ProjectDetailComponent implements OnInit {
  activatedRoute = inject(ActivatedRoute);
  api = inject(ApiService);
  cache = inject(CacheService);
  router = inject(Router);
  resultsCenterService = inject(ResultsCenterService);
  contractId = signal('');
  lastSegment = signal('');
  setupProjectService = inject(SetUpProjectService);
  currentProject = signal<GetProjectDetail>({});
  tabs = computed<ViewTab[]>(() => {
    const tabs = [
      {
        label: 'Project Results',
        route: 'project-results'
      },
      {
        label: 'Project Members',
        route: 'project-members',
        hidden: true
      },
      {
        label: 'Progress towards indicators',
        route: 'progress-towards-indicators',
        hidden: !this.cache.onlyMvpUsers()
      }
    ];
    return tabs;
  });

  ngOnInit(): void {
    this.contractId.set(this.activatedRoute.snapshot.params['id']);
    this.resultsCenterService.primaryContractId.set(this.contractId());
    this.resultsCenterService.resetState();
    this.getProjectDetail();
    this.cache.currentProjectId.set(this.contractId());
    this.getLastSegment();
  }

  getLastSegment() {
    const tree = this.router.parseUrl(this.router.url);
    const segments = tree.root.children[PRIMARY_OUTLET]?.segments ?? [];
    const lastPath = segments.at(-1)?.path ?? '';
    // Si no hay segmento o es el ID del proyecto, usar 'project-results' por defecto
    this.lastSegment.set(lastPath === this.contractId() || !lastPath ? 'project-results' : lastPath);
  }

  onTabClick(tab: ViewTab) {
    this.lastSegment.set(tab.route);
    if (tab.route !== 'project-results') {
      this.router.navigate([tab.route], { relativeTo: this.activatedRoute });
    }
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
