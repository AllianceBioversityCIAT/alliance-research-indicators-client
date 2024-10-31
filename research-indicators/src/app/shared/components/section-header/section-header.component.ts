import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
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
  cache = inject(CacheService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  routeData: WritableSignal<{ title: string | null }> = signal({ title: null });

  ngOnInit(): void {
    this.routeData.set(this.getRouteData(this.route));

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.routeData.set(this.getRouteData(this.route));
      this.cache.setCurrentSectionHeaderName('');
    });
  }

  private getRouteData(route: ActivatedRoute): { title: string | null } {
    let data = {};

    while (route.firstChild) {
      route = route.firstChild;
      data = { ...data, ...route.snapshot.data };
    }

    return data as { title: string | null };
  }
}
