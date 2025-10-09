import { Component, inject, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DownloadOicrTemplateComponent } from '@shared/components/download-oicr-template/download-oicr-template.component';
import { OicrHeaderData } from '@shared/interfaces/oicr-header-data.interface';
import { CustomTagComponent } from '../custom-tag/custom-tag.component';
import { SubmissionService } from '@shared/services/submission.service';

@Component({
  selector: 'app-oicr-header',
  standalone: true,
  templateUrl: './oicr-header.component.html',
  imports: [DatePipe, DownloadOicrTemplateComponent, CustomTagComponent]
})
export class OicrHeaderComponent {
  @Input() data: OicrHeaderData | null = null;
  @Input() showDownload = false;
  @Input() showTag = false;
  submissionService = inject(SubmissionService);

  getStatusName(id: number): string {
    return this.submissionService.getStatusNameById(id);
  }
}


