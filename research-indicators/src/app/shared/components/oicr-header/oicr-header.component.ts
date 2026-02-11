import { Component, Input, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DownloadOicrTemplateComponent } from '@shared/components/download-oicr-template/download-oicr-template.component';
import { OicrHeaderData } from '@shared/interfaces/oicr-header-data.interface';
import { CustomTagComponent } from '../custom-tag/custom-tag.component';
import { OicrWorkflowStatusComponent } from '../oicr-workflow-status/oicr-workflow-status.component';

@Component({
  selector: 'app-oicr-header',
  standalone: true,
  templateUrl: './oicr-header.component.html',
  imports: [DatePipe, DownloadOicrTemplateComponent, CustomTagComponent, OicrWorkflowStatusComponent]
})
export class OicrHeaderComponent {
  @Input() data: OicrHeaderData | null = null;
  @Input() showDownload = false;
  @Input() showTag = false;

  readonly intermediateStatusIds = [10, 12, 13, 14];
  
  shouldShowWorkflow = computed(() => {
    const statusId = this.data?.status_id;
    if (!statusId) return false;
    const statusIdNum = Number(statusId);
    return this.intermediateStatusIds.includes(statusIdNum);
  });
}


