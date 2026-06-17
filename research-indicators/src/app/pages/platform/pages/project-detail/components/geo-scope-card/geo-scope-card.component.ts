import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { GeoScopeSummary } from '@interfaces/project-dashboard.interface';
import { ProjectDashboardCardComponent } from '../project-dashboard-card/project-dashboard-card.component';
import { GeoScopeMapComponent } from '../geo-scope-map/geo-scope-map.component';
import { GEO_SCOPE_SUMMARY_COLORS } from '@shared/constants/project-dashboard-chart-colors.constants';
import { GetGeoScopeService } from '@services/get-geo-scope.service';

interface GeoScopeMetric {
  key: keyof GeoScopeSummary;
  label: string;
  value: number;
}

interface GeoScopeDonutSegment extends GeoScopeMetric {
  start: number;
  end: number;
  color: string;
}

@Component({
  selector: 'app-geo-scope-card',
  standalone: true,
  imports: [ProjectDashboardCardComponent, GeoScopeMapComponent],
  templateUrl: './geo-scope-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeoScopeCardComponent {
  readonly service = inject(GetGeoScopeService);

  readonly isEmpty = computed(() => {
    if (this.service.loading() || this.service.loadError()) {
      return false;
    }

    const summary = this.service.summary();
    const summaryTotal =
      Number(summary.global ?? 0) +
      Number(summary.regional ?? 0) +
      Number(summary.countries ?? 0) +
      Number(summary.sub_national ?? 0) +
      Number(summary.yet_to_be_determined ?? 0);

    return summaryTotal === 0 && this.service.topRegionsList().length === 0 && this.service.topCountries().length === 0;
  });

  readonly summaryMetrics = computed<GeoScopeMetric[]>(() => {
    const summary = this.service.summary();
    if (!Object.keys(summary).length) {
      return [];
    }

    return [
      { key: 'global', label: 'Global', value: Number(summary.global ?? 0) },
      { key: 'regional', label: 'Regional', value: Number(summary.regional ?? 0) },
      { key: 'countries', label: 'Countries', value: Number(summary.countries ?? 0) },
      { key: 'sub_national', label: 'Sub-national', value: Number(summary.sub_national ?? 0) },
      { key: 'yet_to_be_determined', label: 'Yet to be determined', value: Number(summary.yet_to_be_determined ?? 0) }
    ];
  });

  readonly donutTotal = computed(() => this.summaryMetrics().reduce((sum, metric) => sum + metric.value, 0));

  readonly donutSegments = computed<GeoScopeDonutSegment[]>(() => {
    const total = this.donutTotal();
    if (total <= 0) {
      return [];
    }

    let accumulated = 0;
    return this.summaryMetrics()
      .filter(metric => metric.value > 0)
      .map(metric => {
        const start = (accumulated / total) * 100;
        accumulated += metric.value;
        return {
          ...metric,
          start,
          end: (accumulated / total) * 100,
          color: GEO_SCOPE_SUMMARY_COLORS[metric.key]
        };
      });
  });

  readonly donutGradient = computed(() => {
    const segments = this.donutSegments();
    if (!segments.length) {
      return 'conic-gradient(#e8ebed 0 100%)';
    }

    return `conic-gradient(${segments.map(segment => `${segment.color} ${segment.start}% ${segment.end}%`).join(', ')})`;
  });

  readonly topRegions = computed(() =>
    this.service.topRegionsList().map((item, index) => ({
      id: item.region_name ?? String(index),
      label: item.region_name ?? '—',
      count: Number(item.results_count ?? item.count ?? 0)
    }))
  );
}
