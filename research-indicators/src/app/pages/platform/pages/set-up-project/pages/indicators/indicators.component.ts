import { Component, inject, signal, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ApiService } from '../../../../../../shared/services/api.service';
import { GetIndicators } from '../../../../../../shared/interfaces/get-indicators.interface';
import { SetUpProjectService } from '../../set-up-project.service';
import { ManageIndicatorModalComponent } from '../../components/manage-indicator-modal/manage-indicator-modal.component';

@Component({
  selector: 'app-indicators',
  imports: [ButtonModule, TooltipModule, ManageIndicatorModalComponent],
  templateUrl: './indicators.component.html',
  styleUrl: './indicators.component.scss'
})
export default class IndicatorsComponent implements OnInit {
  indicators = signal<GetIndicators[]>([]);
  apiService = inject(ApiService);
  setUpProjectService = inject(SetUpProjectService);

  ngOnInit() {
    this.getIndicators();
  }

  async getIndicators() {
    const res = await this.apiService.GET_Indicators();
    this.indicators.set(res.data);
  }
}
