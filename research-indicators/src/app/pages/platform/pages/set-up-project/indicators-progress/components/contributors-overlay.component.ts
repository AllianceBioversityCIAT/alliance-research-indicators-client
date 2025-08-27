import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';

@Component({
  selector: 'app-contributors-overlay',
  standalone: true,
  imports: [CommonModule, ButtonModule, OverlayPanelModule],
  template: `
    <p-button
      [label]="buttonLabel"
      icon="pi pi-users"
      severity="secondary"
      [text]="true"
      size="small"
      (onClick)="op.toggle($event)"
      class="text-xs" />

    <p-overlayPanel #op [showCloseIcon]="true" [style]="{ width: '400px' }">
      <div class="contributors-overlay">
        <div class="mb-3">
          <h6 class="text-sm font-semibold atc-primary-blue-500 flex items-center gap-2">
            <i class="pi pi-users text-xs"></i>
            Contributors ({{ contributions.length }})
          </h6>
        </div>

        <div class="space-y-2 max-h-64 overflow-y-auto">
          @for (contribution of contributions; track contribution.result_id) {
            <div class="flex items-center justify-between p-2 abc-grey-100 rounded border border-gray-200 hover:abc-grey-200 transition-colors">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="abc-primary-blue-100 atc-primary-blue-600 px-2 py-0.5 rounded text-xs font-mono font-medium">
                    {{ contribution.result_official_code }}
                  </span>
                </div>
                <div class="text-sm font-medium atc-grey-800 truncate">
                  {{ contribution.title }}
                </div>
              </div>
              <div class="ml-2">
                <span class="abc-green-100 atc-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                  {{ contribution.contribution_value === null ? 'N/A' : contribution.contribution_value }}
                </span>
              </div>
            </div>
          }
        </div>
      </div>
    </p-overlayPanel>
  `,
  styles: [
    `
      .contributors-overlay {
        padding: 4px;
      }
    `
  ]
})
export class ContributorsOverlayComponent {
  @Input() contributions: any[] = [];
  @Input() contributorsCount: number = 0;

  get buttonLabel(): string {
    return this.contributorsCount > 0 ? `Show Contributors (${this.contributorsCount})` : 'No Contributors';
  }
}
