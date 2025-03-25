import { Component, inject, OnDestroy, ViewChild, ElementRef, computed, signal, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CacheService } from '@services/cache/cache.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { OverlayPanel } from 'primeng/overlaypanel';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule } from 'primeng/popover';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ActionsService } from '@shared/services/actions.service';
import { ApiService } from '../../services/api.service';
import { SubmissionService } from '../../services/submission.service';

@Component({
  selector: 'app-section-header',
  imports: [CommonModule, PopoverModule, ButtonModule, TooltipModule, MenuModule],
  templateUrl: './section-header.component.html',
  styleUrl: './section-header.component.scss'
})
export class SectionHeaderComponent implements OnDestroy, AfterViewInit {
  router = inject(Router);
  cache = inject(CacheService);
  route = inject(ActivatedRoute);
  elementRef = inject(ElementRef);
  actions = inject(ActionsService);
  api = inject(ApiService);
  submissionService = inject(SubmissionService);
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
            event: async () => {
              const res = await this.api.DELETE_Result(this.cache.currentResultId());
              if (res.successfulRequest) this.router.navigate(['/results-center']);
            }
          }
        });
      }
    };

    const items: MenuItem[] = [
      {
        items: [
          {
            label: 'Submission History',
            icon: 'pi pi-clock',
            command: () => {
              this.cache.showSubmissionHistory.set(true);
            }
          }
        ]
      }
    ];

    if (!this.submissionService.currentResultIsSubmitted() && this.cache.isMyResult()) items[0].items?.push(deleteOption);

    return items;
  });

  @ViewChild('historyPanel') historyPanel!: OverlayPanel;
  private resizeObserver: ResizeObserver | null = null;
  private routeId = signal<string | null>(null);

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

  getHistoryItemTitle(item: { title: string; id: string | null }): string {
    return item.id ? `${item.title} (id: ${item.id})` : item.title;
  }

  welcomeMessage = computed(() => {
    if (this.cache.currentRouteTitle() === 'Home') {
      const userName = this.cache.dataCache().user?.first_name || '';
      return `Welcome, ${userName}`;
    }
    return this.cache.currentRouteTitle();
  });
}
