import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef, effect } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CacheService } from '@services/cache/cache.service';
import { computed, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { OverlayPanel } from 'primeng/overlaypanel';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule } from 'primeng/popover';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ActionsService } from '@shared/services/actions.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-section-header',
  imports: [CommonModule, PopoverModule, ButtonModule, TooltipModule, MenuModule],
  templateUrl: './section-header.component.html',
  styleUrl: './section-header.component.scss'
})
export class SectionHeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  showSectionHeaderActions = signal(false);
  router = inject(Router);
  cache = inject(CacheService);
  route = inject(ActivatedRoute);
  elementRef = inject(ElementRef);
  actions = inject(ActionsService);
  api = inject(ApiService);

  items: MenuItem[] | undefined;

  @ViewChild('historyPanel') historyPanel!: OverlayPanel;
  private resizeObserver: ResizeObserver | null = null;
  private currentUrl = signal('');
  private routeTitle = signal('');
  private routeId = signal<string | null>(null);

  ngOnInit() {
    // Set initial values
    this.currentUrl.set(this.router.url);
    this.updateRouteInfo();

    this.items = [
      {
        items: [
          {
            label: 'Submission History',
            icon: 'pi pi-clock',
            command: () => {
              this.cache.showSubmissionHistory.set(true);
            }
          },
          {
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
                  event: async () => {
                    const res = await this.api.DELETE_Result(this.cache.currentResultId());
                    if (res.successfulRequest) this.router.navigate(['/results-center']);
                  }
                }
              });
            }
          }
        ]
      }
    ];
  }

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
    // this.subscription.unsubscribe();
    this.resizeObserver?.disconnect();
  }

  onChangePath = effect(
    () => {
      this.cache.currentUrlPath();
      this.showSectionHeaderActions.set(!!this.route.firstChild?.snapshot.data['showSectionHeaderActions']);
    },
    {
      allowSignalWrites: true
    }
  );

  private updateRouteInfo() {
    let currentRoute = this.route;
    // Navigate to the deepest route
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }

    const baseTitle = currentRoute.snapshot.data['title'] || '';
    this.routeTitle.set(baseTitle);

    // Find the result route segment that contains the ID
    let resultRoute = currentRoute;
    while (resultRoute.parent) {
      if (resultRoute.snapshot.url.some(segment => segment.path === 'result') && resultRoute.snapshot.params['id']) {
        this.routeId.set(resultRoute.snapshot.params['id']);
        return;
      }
      resultRoute = resultRoute.parent;
    }
    this.routeId.set(null);
  }

  getHistoryItemTitle(item: { title: string; id: string | null }): string {
    return item.id ? `${item.title} (id: ${item.id})` : item.title;
  }

  isHomePage = computed(() => {
    const url = this.currentUrl();
    return url === '/home' || url === '/' || url.startsWith('/?');
  });

  welcomeMessage = computed(() => {
    if (this.isHomePage()) {
      const userName = this.cache.dataCache().user?.first_name || '';
      return `Welcome, ${userName}`;
    }
    return this.routeTitle();
  });
}
