import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DownloadOicrTemplateComponent } from '@shared/components/download-oicr-template/download-oicr-template.component';

@Component({
  selector: 'app-oicr-header',
  standalone: true,
  templateUrl: './oicr-header.component.html',
  imports: [DatePipe, DownloadOicrTemplateComponent]
})
export class OicrHeaderComponent {
  @Input() data: any;
  @Input() showDownload = false;
}


