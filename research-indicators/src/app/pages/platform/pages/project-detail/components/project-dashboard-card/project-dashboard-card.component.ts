import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CustomProgressBarComponent } from '@shared/components/custom-progress-bar/custom-progress-bar.component';

@Component({
  selector: 'app-project-dashboard-card',
  standalone: true,
  imports: [ButtonModule, CustomProgressBarComponent],
  templateUrl: './project-dashboard-card.component.html',
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectDashboardCardComponent {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly loading = input(false);
  readonly error = input(false);
  readonly empty = input(false);
  readonly compact = input(false);
  readonly errorMessage = input('We could not load this data. Please try again.');
  readonly emptyMessage = input('No data available for this project yet.');
  readonly iconClass = input('pi pi-chart-bar');
  readonly retry = output<void>();
}
