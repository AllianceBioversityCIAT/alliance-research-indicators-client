import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AllianceNavbarComponent } from '@components/alliance-navbar/alliance-navbar.component';
import { AllianceSidebarComponent } from '@components/alliance-sidebar/alliance-sidebar.component';
import { SectionHeaderComponent } from '@components/section-header/section-header.component';
import { AllModalsComponent } from '../../shared/components/all-modals/all-modals.component';
import { ScrollToTopService } from '@shared/services/scroll-top.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-platform',
  imports: [RouterOutlet, AllianceNavbarComponent, AllianceSidebarComponent, SectionHeaderComponent, AllModalsComponent],
  templateUrl: './platform.component.html',
  styleUrl: './platform.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class PlatformComponent implements OnInit, OnDestroy {
  private routerSubscription!: Subscription;
  private readonly router = inject(Router);
  private readonly scrollService = inject(ScrollToTopService);

  ngOnInit(): void {
    this.routerSubscription = this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe({
      next: () => {
        this.scrollService.scrollContentToTop('content');
      },
      error: err => {
        console.error(err);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription && !this.routerSubscription.closed) {
      this.routerSubscription.unsubscribe();
    }
  }
}
