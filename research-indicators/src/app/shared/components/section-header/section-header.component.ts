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
  private isNavigatingBack = false;

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

        if (!this.isNavigatingBack) {
          this.addToHistory(this.router.url, this.routeTitle(), this.routeId());
        }
        this.isNavigatingBack = false;

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
    // Don't add login or empty URLs to history
    if (url.includes('login') || !url) {
      return;
    }

    const history = this.navigationHistory();
    const newHistory = [...history, { url, title, id }].slice(-10);
    this.navigationHistory.set(newHistory);
  }

  // Computed signal for filtered history display
  filteredHistory = computed(() => {
    const history = this.navigationHistory();
    const seen = new Set();
    return history
      .filter(item => {
        const key = `${item.url}-${item.id}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      })
      .reverse();
  });

  getHistoryItemTitle(item: { title: string; id: string | null }): string {
    return item.id ? `${item.title} (id: ${item.id})` : item.title;
  }

  canGoBack = computed(() => this.navigationHistory().length > 1);

  goBack() {
    if (this.canGoBack()) {
      this.isNavigatingBack = true;
      const history = this.navigationHistory();
      const previousPage = history[history.length - 2];

      // Remove the current page from history before navigation
      this.navigationHistory.set(history.slice(0, -1));

      if (previousPage && previousPage.url) {
        // Update title and URL immediately
        this.currentUrl.set(previousPage.url);
        this.routeTitle.set(previousPage.title);
        this.routeId.set(previousPage.id);

        // Navigate to the previous page
        this.router.navigate([previousPage.url]);
      }
    }
  }

  navigateToHistoryItem(index: number) {
    const history = this.filteredHistory();
    if (index >= 0 && index < history.length) {
      this.isNavigatingBack = true;
      const selectedItem = history[index];

      // Update title and URL immediately
      this.currentUrl.set(selectedItem.url);
      this.routeTitle.set(selectedItem.title);
      this.routeId.set(selectedItem.id);

      // Navigate to the selected page
      this.router.navigate([selectedItem.url]);

      if (this.historyPanel) {
        this.historyPanel.hide();
      }

      // Update the main history
      const mainHistory = this.navigationHistory();
      const mainIndex = mainHistory.findIndex(item => item.url === selectedItem.url && item.id === selectedItem.id);
      if (mainIndex !== -1) {
        this.navigationHistory.set(mainHistory.slice(0, mainIndex + 1));
      }
    }
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
