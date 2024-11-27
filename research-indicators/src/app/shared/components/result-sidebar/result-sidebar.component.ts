import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CacheService } from '../../services/cache/cache.service';

@Component({
  selector: 'app-result-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ButtonModule],
  templateUrl: './result-sidebar.component.html',
  styleUrl: './result-sidebar.component.scss'
})
export class ResultSidebarComponent {
  cache = inject(CacheService);
  allOptions = signal([
    {
      label: 'General information',
      path: 'general-information'
    },
    {
      label: 'Alliance Alignment',
      path: 'alliance-alignment'
    },
    {
      label: 'Capacity Sharing',
      path: 'capacity-sharing',
      indicator_id: 1
    },
    {
      label: 'Policy Change details',
      path: 'policy-change',
      indicator_id: 4
    },
    {
      label: 'Partners',
      path: 'partners'
    },
    {
      label: 'Geographic scope',
      path: 'geographic-scope',
      disabled: true
    },
    {
      label: 'Evidence',
      path: 'evidence'
    }
  ]);

  options = computed(() => {
    return this.allOptions().filter(option => option.indicator_id === this.cache.currentMetadata().indicator_id || !option.indicator_id);
  });
}
