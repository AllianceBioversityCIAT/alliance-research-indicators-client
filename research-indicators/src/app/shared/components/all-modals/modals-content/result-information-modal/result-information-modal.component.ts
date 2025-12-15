import { Component, inject, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { ButtonModule } from 'primeng/button';
import { S3ImageUrlPipe } from '@shared/pipes/s3-image-url.pipe';
import { Result } from '@shared/interfaces/result/result.interface';
import { CustomTagComponent } from '@shared/components/custom-tag/custom-tag.component';
import { PLATFORM_COLOR_MAP } from '@shared/constants/platform-colors';
import { PLATFORM_CODES } from '@shared/constants/platform-codes';

@Component({
  selector: 'app-result-information-modal',
  imports: [CommonModule, ButtonModule, DatePipe, S3ImageUrlPipe, CustomTagComponent],
  templateUrl: './result-information-modal.component.html'
})
export class ResultInformationModalComponent {
  allModals = inject(AllModalsService);

  result = computed(() => this.allModals.selectedResultForInfo());

  close = () => this.allModals.closeModal('resultInformation');

  getPlatformColors(platformCode: string): { text: string; background: string } | undefined {
    return PLATFORM_COLOR_MAP[platformCode];
  }
  formatResultCode(code: string | number | null | undefined): string {
    if (code === null || code === undefined) return '';
    const str = String(code);
    if (!str) return '';
    return str.padStart(3, '0');
  }
  getValue(result?: Result): string {
    const r = result ?? this.result();
    if (!r) return '-';
    const levers = (r.result_levers as { is_primary: number | string; lever?: { short_name?: string } }[] | undefined) ?? [];
    if (!Array.isArray(levers) || levers.length === 0) return '-';
    const primaryLevers = levers.filter(l => Number(l.is_primary) === 1);
    if (primaryLevers.length === 0) return '-';
    const text = primaryLevers.map(l => l.lever?.short_name ?? '').filter(v => v.length > 0).join(', ');
    return text || '-';
  }

  openExternalLink(): void {
    const currentResult = this.result();
    const link = currentResult?.external_link;
    if (!currentResult || !link) return;

    const isSupportedPlatform = currentResult.platform_code === PLATFORM_CODES.TIP || currentResult.platform_code === PLATFORM_CODES.AICCRA || currentResult.platform_code === PLATFORM_CODES.PRMS;
    if (isSupportedPlatform) {
      globalThis.open(link, '_blank', 'noopener');
    }
  }
}


