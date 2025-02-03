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
  private subscription = new Subscription();
  navigationHistory = signal<{ url: string; title: string }[]>([]);

  ngOnInit() {
    // Set initial values
    this.currentUrl.set(this.router.url);
    this.updateRouteTitle();
    this.addToHistory(this.router.url, this.routeTitle());

    // Subscribe to route changes
    this.subscription.add(
      this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(() => {
        this.currentUrl.set(this.router.url);
        this.updateRouteTitle();
        this.addToHistory(this.router.url, this.routeTitle());
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

  private updateRouteTitle() {
    let currentRoute = this.route;
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }
    const baseTitle = currentRoute.snapshot.data['title'] || '';
    const params = currentRoute.snapshot.params;

    // Add ID to title if present in route params
    if (params['id']) {
      this.routeTitle.set(`${baseTitle} #${params['id']}`);
    } else {
      this.routeTitle.set(baseTitle);
    }
  }

  private addToHistory(url: string, title: string) {
    const history = this.navigationHistory();
    // Don't add duplicates consecutively
    if (history.length === 0 || history[history.length - 1].url !== url) {
      // Limit history to last 10 entries
      const newHistory = [...history, { url, title }].slice(-10);
      this.navigationHistory.set(newHistory);
    }
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
