import { Component, inject, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { IndicatorsService } from '@services/indicators.service';
import { RouterLink } from '@angular/router';
import { CacheService } from '../../../../shared/services/cache.service';
import { Indicator } from '../../../../shared/interfaces/api.interface';

@Component({
  selector: 'app-about-indicators',
  standalone: true,
  imports: [CardModule, RouterLink],
  templateUrl: './about-indicators.component.html',
  styleUrl: './about-indicators.component.scss'
})
export default class AboutIndicatorsComponent implements OnInit {
  indicatorsSE = inject(IndicatorsService);
  cache = inject(CacheService);

  ngOnInit() {
    this.cache.setCurrentSectionHeaderName('About indicators');
  }

  onSelectIndicator(indicator: Indicator) {
    this.cache.setCurrentSectionHeaderName(indicator.name);
  }
}
