import { Component, inject, OnDestroy, ViewChild, ElementRef, computed, signal, AfterViewInit, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule, NavigationEnd } from '@angular/router';
import { CacheService } from '@services/cache/cache.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule, Popover } from 'primeng/popover';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ActionsService } from '@shared/services/actions.service';
import { ApiService } from '../../services/api.service';
import { SubmissionService } from '../../services/submission.service';
import { GetProjectDetail } from '../../interfaces/get-project-detail.interface';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

export interface BreadcrumbItem {
  label: string;
  route?: string;
  tooltip?: string;
}

@Component({
  selector: 'app-section-header',
  imports: [CommonModule, PopoverModule, ButtonModule, TooltipModule, MenuModule, RouterModule],
  templateUrl: './section-header.component.html',
  styleUrl: './section-header.component.scss'
})
export class SectionHeaderComponent implements OnDestroy, AfterViewInit, OnInit {
  router = inject(Router);
  cache = inject(CacheService);
  route = inject(ActivatedRoute);
  elementRef = inject(ElementRef);
  actions = inject(ActionsService);
  api = inject(ApiService);
  submissionService = inject(SubmissionService);

  private currentProject = signal<GetProjectDetail>({});
  private contractId = signal('');
  private currentUrl = signal('');
  private routerSubscription!: Subscription;
  private currentResult = signal<{ title?: string; project_id?: string }>({});
  private currentResultId = signal('');
  showDeleteOption = computed(() => {
    const statusId = this.cache.currentMetadata()?.status_id;
    return statusId === 5 || statusId === 7 || (statusId === 4 && this.cache.isMyResult());
  });
  resultTitle = signal('');
  items = computed((): MenuItem[] => {
    const deleteOption: MenuItem = {
      label: 'Delete Result',
      icon: 'pi pi-trash',
      styleClass: 'delete-result',
      command: () => {
        this.actions.showGlobalAlert({
          severity: 'warning',
          summary: 'Are you sure you want to delete this result? ',
          detail: 'Once deleted, it cannot be recovered.',
          confirmCallback: {
            label: 'Delete result',
            event: () => {
              (async () => {
                const res = await this.api.DELETE_Result(this.cache.currentResultId());
                if (res.successfulRequest) this.router.navigate(['/results-center']);
              })();
            }
          }
        });
      }
    };

    const items: MenuItem[] = [
      {
        items: []
      }
    ];

    if (this.showDeleteOption()) {
      items[0].items?.push(deleteOption);
    }
    return items;
  });

  @ViewChild('historyPanel') historyPanel!: Popover;
  private resizeObserver: ResizeObserver | null = null;
  private readonly routeId = signal<string | null>(null);

  ngAfterViewInit(): void {
    const sectionSidebar = this.elementRef.nativeElement.querySelector('#section-sidebar');
    if (sectionSidebar) {
      this.resizeObserver = new ResizeObserver(() => {
        const totalHeight = sectionSidebar.getBoundingClientRect().height;
        this.cache.headerHeight.set(totalHeight);
      });

      this.resizeObserver.observe(sectionSidebar);
    }
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
    this.routerSubscription?.unsubscribe();
  }

  getHistoryItemTitle(item: { title: string; id: string | null }): string {
    return item.id ? `${item.title} (id: ${item.id})` : item.title;
  }

  welcomeMessage = computed(() => {
    if (this.cache.currentRouteTitle() === 'Home') {
      const userName = this.cache.dataCache().user?.first_name ?? '';
      return `Welcome, ${userName}`;
    }
    return this.cache.currentRouteTitle();
  });

  isProjectDetailPage = computed(() => {
    return this.currentUrl().includes('/project-detail/');
  });

  isSetUpProjectPage = computed(() => {
    return this.currentUrl().includes('/set-up-project');
  });

  isResultPage = computed(() => {
    return this.currentUrl().includes('/result/') && this.currentUrl().split('/').length >= 3;
  });

  breadcrumb = computed(() => {
    const project = this.currentProject();
    const contractId = this.contractId();

    if (!contractId) return [];

    let baseItems: BreadcrumbItem[] = [
      {
        label: 'Projects',
        route: '/projects'
      },
      {
        label: `Project ${contractId}`,
        tooltip: project?.projectDescription ?? project?.description
      }
    ];

    if (this.isSetUpProjectPage()) {
      const urlParts = this.currentUrl().split('/');
      const agreementId = urlParts[2]; // /result/2243/any-page -> 2243

      if (agreementId) {
        baseItems[1].route = `/project-detail/${agreementId}`;
        baseItems[1].label = `Project ${agreementId}`;
        baseItems = [
          ...baseItems,
          {
            label: `Set up project`,
            tooltip: 'Set up project'
          }
        ];
      }
    }

    if (this.isResultPage()) {
      const urlParts = this.currentUrl().split('/');
      const resultId = urlParts[2]; // /result/2243/any-page -> 2243

      if (resultId) {
        baseItems[1].route = `/project-detail/${contractId}`;

        baseItems.push({
          label: `Result ${resultId}`,
          tooltip: this.resultTitle()
        });
      }
    }

    return baseItems;
  });

  ngOnInit(): void {
    this.currentUrl.set(this.router.url);

    this.routerSubscription = this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.currentUrl.set(event.url);

      if (this.isProjectDetailPage() || this.isResultPage() || this.isSetUpProjectPage()) {
        this.loadData();
      } else {
        this.clearData();
      }
    });

    this.loadData();
  }

  private clearData() {
    this.currentProject.set({});
    this.contractId.set('');
    this.currentResult.set({});
    this.currentResultId.set('');
    this.resultTitle.set('');
  }

  private async loadData() {
    if (this.isProjectDetailPage()) {
      await this.loadProjectData();
    } else if (this.isResultPage()) {
      await this.loadResultData();
    }
  }

  private async loadProjectData() {
    const urlParts = this.router.url.split('/');
    const projectId = urlParts[urlParts.length - 1];
    this.contractId.set(projectId);

    try {
      const response = await this.api.GET_ResultsCount(projectId);
      if (response?.data) {
        this.currentProject.set(response.data);
      }
    } catch (error) {
      console.error('Error loading project data:', error);
    }
  }

  private async loadResultData() {
    const urlParts = this.router.url.split('/');
    const resultId = urlParts[2]; // /result/2243/any-page -> 2243
    this.currentResultId.set(resultId);

    try {
      const [alignmentsResponse, resultResponse] = await Promise.all([
        this.api.GET_Alignments(parseInt(resultId)),
        this.api.GET_GeneralInformation(parseInt(resultId))
      ]);

      if (resultResponse?.data?.title) {
        this.resultTitle.set(resultResponse.data.title);
      }

      if (alignmentsResponse?.data?.contracts) {
        const primaryContract = alignmentsResponse.data.contracts.find(
          (contract: { is_primary: boolean; contract_id: string }) => contract.is_primary === true
        );

        if (primaryContract) {
          await this.loadProjectDataById(primaryContract.contract_id);
        }
      }
    } catch (error) {
      console.error('Error loading result data:', error);
    }
  }

  private async loadProjectDataById(projectId: string) {
    this.contractId.set(projectId);

    try {
      const response = await this.api.GET_ResultsCount(projectId);
      if (response?.data) {
        this.currentProject.set(response.data);
      }
    } catch (error) {
      console.error('Error loading project data:', error);
    }
  }
}
