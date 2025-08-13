import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SetUpProjectService } from '../../set-up-project.service';

@Component({
  selector: 'app-indicator-list-modal',
  imports: [DialogModule, ButtonModule],
  templateUrl: './indicator-list-modal.component.html',
  styleUrl: './indicator-list-modal.component.scss'
})
export class IndicatorListModalComponent {
  setUpProjectService = inject(SetUpProjectService);
}
