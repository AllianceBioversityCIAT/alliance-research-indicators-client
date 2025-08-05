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
  showDeleteOption = computed(() => {
    const statusId = this.cache.currentMetadata()?.status_id;
    return statusId === 5 || statusId === 7 || (statusId === 4 && this.cache.isMyResult());
  });

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

  projectBreadcrumb = computed(() => {
    if (!this.isProjectDetailPage()) return [];

    const project = this.currentProject();
    const contractId = this.contractId();

    if (!contractId) return [];

    return [
      {
        label: 'Projects',
        route: '/my-projects'
      },
      {
        label: `Project ${contractId}`,
        tooltip: project?.projectDescription ?? project?.description
      }
    ] as BreadcrumbItem[];
  });

  ngOnInit(): void {
    this.currentUrl.set(this.router.url);

    this.routerSubscription = this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.currentUrl.set(event.url);

      if (this.isProjectDetailPage()) {
        this.loadProjectData();
      } else {
        // Limpiar datos cuando no estamos en project-detail
        this.currentProject.set({});
        this.contractId.set('');
      }
    });

    if (this.isProjectDetailPage()) {
      this.loadProjectData();
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
}
