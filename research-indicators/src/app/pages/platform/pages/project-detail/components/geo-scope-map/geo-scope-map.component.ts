import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ProjectDashboardRankedListItem } from '@interfaces/project-dashboard.interface';

@Component({
  selector: 'app-geo-scope-map',
  standalone: true,
  templateUrl: './geo-scope-map.component.html',
  styleUrl: './geo-scope-map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeoScopeMapComponent {
  readonly countries = input<readonly ProjectDashboardRankedListItem[]>([]);

  readonly maxCount = computed(() => {
    const items = this.countries();
    if (!items.length) {
      return 0;
    }
    return Math.max(...items.map(item => item.count), 0);
  });

  intensityClass(count: number): string {
    const max = this.maxCount();
    if (max <= 0 || count <= 0) {
      return 'geo-scope-map__chip--low';
    }
    const ratio = count / max;
    if (ratio >= 0.75) {
      return 'geo-scope-map__chip--high';
    }
    if (ratio >= 0.4) {
      return 'geo-scope-map__chip--medium';
    }
    return 'geo-scope-map__chip--low';
  }
}
