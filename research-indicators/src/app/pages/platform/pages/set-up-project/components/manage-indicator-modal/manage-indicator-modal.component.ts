import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SetUpProjectService } from '../../set-up-project.service';

@Component({
  selector: 'app-manage-indicator-modal',
  imports: [DialogModule, ButtonModule],
  templateUrl: './manage-indicator-modal.component.html',
  styleUrl: './manage-indicator-modal.component.scss'
})
export class ManageIndicatorModalComponent {
  setUpProjectService = inject(SetUpProjectService);
}
