import { Component, inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, RouterLink, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CacheService } from '@services/cache/cache.service';
import { computed, signal } from '@angular/core';
import { filter, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ButtonModule } from 'primeng/button';
import { OverlayPanel } from 'primeng/overlaypanel';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [RouterLink, CommonModule, OverlayPanelModule, ButtonModule, TooltipModule],
  templateUrl: './section-header.component.html',
  styleUrl: './section-header.component.scss'
})
export class SectionHeaderComponent implements OnInit, OnDestroy {
  router = inject(Router);
  cache = inject(CacheService);
  route = inject(ActivatedRoute);

  @ViewChild('historyPanel') historyPanel!: OverlayPanel;

  private currentUrl = signal('');
  private routeTitle = signal('');
  private routeId = signal<string | null>(null);
  private subscription = new Subscription();
  navigationHistory = signal<{ url: string; title: string; id: string | null }[]>([]);

  ngOnInit() {
    // Set initial values
    this.currentUrl.set(this.router.url);
    this.updateRouteInfo();
    this.addToHistory(this.router.url, this.routeTitle(), this.routeId());

    // Subscribe to route changes
    this.subscription.add(
      this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(() => {
        this.currentUrl.set(this.router.url);
        this.updateRouteInfo();
        this.addToHistory(this.router.url, this.routeTitle(), this.routeId());
        // Close panel when navigating
        if (this.historyPanel) {
          this.historyPanel.hide();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

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

  private addToHistory(url: string, title: string, id: string | null) {
    const history = this.navigationHistory();
    // Don't add duplicates consecutively
    if (history.length === 0 || history[history.length - 1].url !== url) {
      // Limit history to last 10 entries
      const newHistory = [...history, { url, title, id }].slice(-10);
      this.navigationHistory.set(newHistory);
    }
  }

  getHistoryItemTitle(item: { title: string; id: string | null }): string {
    return item.id ? `${item.title} (id: ${item.id})` : item.title;
  }

  canGoBack = computed(() => this.navigationHistory().length > 1);

  goBack() {
    if (this.canGoBack()) {
      window.history.back();
    }
  }

  navigateToHistoryItem(index: number) {
    const history = this.navigationHistory();
    if (index >= 0 && index < history.length) {
      this.router.navigate([history[index].url]);
      if (this.historyPanel) {
        this.historyPanel.hide();
      }
    }
  }

  isHomePage = computed(() => this.currentUrl() === '/home');

  welcomeMessage = computed(() => {
    if (this.isHomePage()) {
      const userName = this.cache.dataCache().user?.first_name || '';
      return `Welcome back, ${userName}!`;
    }
    return this.routeTitle();
  });
}
