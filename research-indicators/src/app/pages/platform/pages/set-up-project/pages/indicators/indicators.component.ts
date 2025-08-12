import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { SetUpProjectService } from '../../set-up-project.service';
import { ManageIndicatorModalComponent } from '../../components/manage-indicator-modal/manage-indicator-modal.component';

@Component({
  selector: 'app-indicators',
  imports: [ButtonModule, TooltipModule, ManageIndicatorModalComponent],
  templateUrl: './indicators.component.html',
  styleUrl: './indicators.component.scss'
})
export default class IndicatorsComponent {
  setUpProjectService = inject(SetUpProjectService);
}
