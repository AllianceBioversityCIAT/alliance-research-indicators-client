import { Component, inject, OnInit, signal } from '@angular/core';
import { ProjectItemComponent } from '@shared/components/project-item/project-item.component';
import { ApiService } from '../../../../shared/services/api.service';
import { ActivatedRoute, PRIMARY_OUTLET, Router, RouterLink, RouterOutlet } from '@angular/router';
import { GetProjectDetail, GetProjectDetailIndicator } from '../../../../shared/interfaces/get-project-detail.interface';
import { TabsModule } from 'primeng/tabs';
import { CacheService } from '../../../../shared/services/cache/cache.service';

interface ViewTab {
  label: string;
  route: string;
  hidden?: boolean;
}

@Component({
  selector: 'app-project-detail',
  imports: [ProjectItemComponent, TabsModule, RouterLink, RouterOutlet],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss'
})
export default class ProjectDetailComponent implements OnInit {
  activatedRoute = inject(ActivatedRoute);
  api = inject(ApiService);
  cache = inject(CacheService);
  router = inject(Router);
  contractId = signal('');
  lastSegment = signal('');
  currentProject = signal<GetProjectDetail>({});
  tabs = signal<ViewTab[]>([
    {
      label: 'Project Results',
      route: 'project-results'
    },
    {
      label: 'Project Members',
      route: '/project-members',
      hidden: true
    },
    {
      label: 'Progress towards indicators',
      route: '/progress-towards-indicators',
      hidden: true
    }
  ]);

  ngOnInit(): void {
    this.contractId.set(this.activatedRoute.snapshot.params['id']);
    this.getProjectDetail();
    this.cache.currentProjectId.set(this.contractId());
    this.getLastSegment();
  }

  getLastSegment() {
    const tree = this.router.parseUrl(this.router.url);
    const segments = tree.root.children[PRIMARY_OUTLET]?.segments ?? [];
    this.lastSegment.set(segments.at(-1)?.path ?? '');
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
}
