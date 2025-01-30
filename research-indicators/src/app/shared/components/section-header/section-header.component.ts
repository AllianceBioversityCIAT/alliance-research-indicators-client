import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { CacheService } from '@services/cache/cache.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './section-header.component.html',
  styleUrl: './section-header.component.scss'
})
export class SectionHeaderComponent implements OnInit {
  private cache = inject(CacheService);
  private router = inject(Router);

  isHomePage = signal(false);
  welcomeMessage = computed(() => {
    if (!this.isHomePage()) return 'Result information';
    const user = this.cache.dataCache()?.user;
    return `Welcome, ${user?.first_name || ''} ${user?.last_name || ''}`.trim();
  });

  ngOnInit(): void {
    this.setupRouteTracking();
  }

  private setupRouteTracking(): void {
    // Check initial route
    this.isHomePage.set(this.router.url === '/home');

    // Track route changes
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe({
      next: (event: NavigationEnd) => {
        this.isHomePage.set(event.urlAfterRedirects === '/home');
      }
    });
  }
}
