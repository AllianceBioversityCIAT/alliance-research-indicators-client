import { Component, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { IndicatorsService } from '../../../../shared/services/indicators.service';

@Component({
  selector: 'app-about-indicators',
  standalone: true,
  imports: [CardModule],
  templateUrl: './about-indicators.component.html',
  styleUrl: './about-indicators.component.scss'
})
export default class AboutIndicatorsComponent {
  indicatorSE = inject(IndicatorsService);
}
