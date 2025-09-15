import { Component, inject } from '@angular/core';
import { SetUpProjectService } from '../../../../../set-up-project/set-up-project.service';

@Component({
  selector: 'app-progress-detail-content',
  imports: [],
  templateUrl: './progress-detail-content.component.html',
  styleUrl: './progress-detail-content.component.scss'
})
export class ProgressDetailContentComponent {
  setupProjectService = inject(SetUpProjectService);
}
