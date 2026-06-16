import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { TruncatedTextTooltipDirective } from '@shared/directives/truncated-text-tooltip.directive';
import { projectDashboardBarColor } from '@shared/constants/project-dashboard-chart-colors.constants';
import { ProjectDashboardRankedListItem } from '@interfaces/project-dashboard.interface';

export type ProjectDashboardChartLayout = 'columns' | 'rows' | 'rows-partners' | 'rows-stacked' | 'rows-stacked-lever';

@Component({
  selector: 'app-project-dashboard-ranked-list',
  standalone: true,
  imports: [TooltipModule, TruncatedTextTooltipDirective],
  templateUrl: './project-dashboard-ranked-list.component.html',
  host: { class: 'flex h-full min-h-0 w-full min-w-0 flex-1 flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectDashboardRankedListComponent {
  readonly items = input.required<readonly ProjectDashboardRankedListItem[]>();
  readonly layout = input<ProjectDashboardChartLayout>('columns');
  readonly largeColumns = input(false);

  readonly maxCount = computed(() => {
    const items = this.items();
    if (!items.length) {
      return 0;
    }
    return Math.max(...items.map(item => item.count), 0);
  });

  readonly totalCount = computed(() => this.items().reduce((sum, item) => sum + item.count, 0));

  fillPercent(count: number): number {
    if (count <= 0) {
      return 0;
    }

    const layout = this.layout();
    if (layout === 'columns' || layout === 'rows-partners') {
      const max = this.maxCount();
      if (max <= 0) {
        return 0;
      }
      return Math.min(100, (count / max) * 100);
    }

    if (layout === 'rows' || layout === 'rows-stacked' || layout === 'rows-stacked-lever') {
      const total = this.totalCount();
      if (total <= 0) {
        return 0;
      }
      return Math.min(100, (count / total) * 100);
    }

    const max = this.maxCount();
    if (max <= 0) {
      return 0;
    }
    return Math.min(100, (count / max) * 100);
  }

  barColor(index: number): string {
    return projectDashboardBarColor(index, this.items().length);
  }
}
