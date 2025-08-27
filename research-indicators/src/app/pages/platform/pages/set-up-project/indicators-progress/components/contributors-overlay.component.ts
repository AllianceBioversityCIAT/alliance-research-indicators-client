import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';

interface Contribution {
  result_id: string;
  result_official_code: string;
  title: string;
  contribution_value: number | null;
}

@Component({
  selector: 'app-contributors-overlay',
  standalone: true,
  imports: [CommonModule, ButtonModule, PopoverModule],
  template: `
    <p-button
      [label]="buttonLabel"
      icon="pi pi-users"
      severity="secondary"
      [text]="true"
      size="small"
      (onClick)="popover.toggle($event)"
      class="text-xs" />

    <p-popover #popover [style]="{ width: '450px' }">
      <div class="contributors-overlay">
        <div class="mb-4 pb-3 border-b border-gray-200">
          <h6 class="text-sm font-semibold atc-primary-blue-500 flex items-center gap-2 mb-3">
            <i class="pi pi-users text-xs"></i>
            Contributors ({{ contributions.length }})
          </h6>
          <div class="flex items-center gap-3 text-xs">
            <div class="flex items-center gap-2">
              <span class="atc-grey-600 font-medium">Type:</span>
              <span class="atc-primary-blue-500 px-2 py-1 abc-primary-blue-100 rounded font-medium capitalize">{{ indicatorType }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="atc-grey-600 font-medium">Total:</span>
              <span class="atc-green-600 px-2 py-1 abc-green-100 rounded font-semibold">{{ currentValue }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-3 max-h-64 overflow-y-auto">
          @for (contribution of contributions; track contribution.result_id) {
            <div
              class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors shadow-sm">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2">
                  <span class="abc-primary-blue-500 atc-white-1 px-2 py-1 rounded text-xs font-mono font-medium">
                    {{ contribution.result_official_code }}
                  </span>
                </div>
                <div class="text-sm font-medium atc-grey-800 truncate">
                  {{ contribution.title }}
                </div>
              </div>
              <div class="flex items-center gap-2 ml-3">
                <span class="abc-green-100 atc-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {{ contribution.contribution_value === null ? 'N/A' : contribution.contribution_value }}
                </span>
                <button
                  (click)="openResult(contribution.result_official_code)"
                  class="flex items-center justify-center w-6 h-6 hover:scale-110 transition-transform cursor-pointer"
                  title="Open result details">
                  <i class="pi pi-arrow-up-right text-sm atc-primary-blue-500 hover:atc-primary-blue-400"></i>
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </p-popover>
  `,
  styles: [
    `
      .contributors-overlay {
        padding: 16px;
        background: white;
      }

      :host ::ng-deep .p-popover-content {
        padding: 0;
        border-radius: 8px;
        box-shadow:
          0 4px 6px -1px rgba(0, 0, 0, 0.1),
          0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
    `
  ]
})
export class ContributorsOverlayComponent {
  @Input() contributions: Contribution[] = [];
  @Input() contributorsCount = 0;
  @Input() indicatorType = '';
  @Input() currentValue = 0;

  get buttonLabel(): string {
    return this.contributorsCount > 0 ? `Show Contributors (${this.contributorsCount})` : 'No Contributors';
  }

  openResult(resultCode: string): void {
    const url = `/result/${resultCode}/general-information`;
    window.open(url, '_blank');
  }
}
