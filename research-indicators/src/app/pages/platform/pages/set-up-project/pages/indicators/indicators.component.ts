import { Component, inject, signal, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ApiService } from '../../../../../../shared/services/api.service';
import { GetIndicators } from '../../../../../../shared/interfaces/get-indicators.interface';

@Component({
  selector: 'app-indicators',
  imports: [ButtonModule, TooltipModule],
  templateUrl: './indicators.component.html',
  styleUrl: './indicators.component.scss'
})
export default class IndicatorsComponent implements OnInit {
  indicators = signal<GetIndicators[]>([]);
  apiService = inject(ApiService);

  ngOnInit() {
    this.getIndicators();
  }

  async getIndicators() {
    const res = await this.apiService.GET_Indicators();
    this.indicators.set(res.data);
  }
}
