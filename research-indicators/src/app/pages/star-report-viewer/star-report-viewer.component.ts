import { Component, inject, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@envs/environment';
import { PLATFORM_CODES } from '@shared/constants/platform-codes';
import { S3ImageUrlPipe } from '@shared/pipes/s3-image-url.pipe';
import { ApiService } from '@shared/services/api.service';
import { StarPdfReportName } from '@shared/utils/star-pdf-report.util';

@Component({
  selector: 'app-star-report-viewer',
  imports: [S3ImageUrlPipe],
  templateUrl: './star-report-viewer.component.html'
})
export default class StarReportViewerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly safePdfUrl = signal<SafeResourceUrl | null>(null);
  readonly isProductionEnvironment = environment.production;

  readonly resultCode = this.route.snapshot.paramMap.get('id') ?? '';
  readonly version = this.route.snapshot.queryParamMap.get('version') ?? '';
  readonly reportName = this.resolveReportName(this.route.snapshot.queryParamMap.get('report_name'));

  ngOnInit(): void {
    void this.loadPdf();
  }

  private async loadPdf(): Promise<void> {
    const officialCode = this.getOfficialCode(this.resultCode);
    if (!officialCode) {
      this.errorMessage.set('The STAR result code is missing or invalid.');
      this.loading.set(false);
      return;
    }

    try {
      const reportYear = this.version.trim() ? this.version.trim() : null;
      const response = await this.api.GET_ResultPdfReport(officialCode, PLATFORM_CODES.STAR, reportYear, this.reportName);
      const pdfUrl = response?.data?.trim();
      if (!pdfUrl) {
        this.errorMessage.set('The STAR PDF report is not available yet.');
        return;
      }

      this.safePdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl));
    } catch {
      this.errorMessage.set('We could not generate the STAR PDF report. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  private resolveReportName(value: string | null): StarPdfReportName {
    if (value === 'inn_dev' || value === 'cap_sharing') return value;
    return 'cap_sharing';
  }

  private getOfficialCode(resultCode: string): string {
    const normalized = resultCode.trim();
    if (!normalized) return '';
    const [platformCode, officialCode] = normalized.split('-', 2);
    if (platformCode?.toUpperCase() === PLATFORM_CODES.STAR && officialCode) return officialCode;
    return normalized;
  }
}
