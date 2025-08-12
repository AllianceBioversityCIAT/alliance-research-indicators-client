import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SetUpProjectService } from '../../set-up-project.service';

@Component({
  selector: 'app-assign-indicators-modal',
  imports: [DialogModule, ButtonModule],
  templateUrl: './assign-indicators-modal.component.html',
  styleUrl: './assign-indicators-modal.component.scss'
})
export class AssignIndicatorsModalComponent {
  setUpProjectService = inject(SetUpProjectService);
}
