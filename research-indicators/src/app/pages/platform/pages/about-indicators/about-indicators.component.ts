import { Component, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { IndicatorsService } from '@services/indicators.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about-indicators',
  standalone: true,
  imports: [CardModule, RouterLink],
  templateUrl: './about-indicators.component.html',
  styleUrl: './about-indicators.component.scss'
})
export default class AboutIndicatorsComponent {
  indicatorsSE = inject(IndicatorsService);
}
