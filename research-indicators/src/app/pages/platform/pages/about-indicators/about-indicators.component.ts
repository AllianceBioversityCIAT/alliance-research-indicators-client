import { Component, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { IndicatorsService } from '@services/control-list/indicators.service';
import { RouterLink } from '@angular/router';
import { CacheService } from '@services/cache/cache.service';

@Component({
  selector: 'app-about-indicators',
  standalone: true,
  imports: [CardModule, RouterLink],
  templateUrl: './about-indicators.component.html',
  styleUrl: './about-indicators.component.scss'
})
export default class AboutIndicatorsComponent {
  indicatorsSE = inject(IndicatorsService);
  cache = inject(CacheService);
}
