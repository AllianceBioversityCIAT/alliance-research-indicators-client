import { Component, inject, OnInit } from '@angular/core';
import { IndicatorsService } from '../../../../shared/services/indicators.service';

@Component({
  selector: 'app-indicator',
  standalone: true,
  imports: [],
  templateUrl: './indicator.component.html',
  styleUrl: './indicator.component.scss'
})
export default class IndicatorComponent implements OnInit {
  indicatorsSE = inject(IndicatorsService);

  ngOnInit() {
    this.getIndicatorById(1);
  }

  getIndicatorById(id: number) {
    const allIndicators = [...this.indicatorsSE.aboutIndicatorData.output.list, ...this.indicatorsSE.aboutIndicatorData.outcome.list];
    const indicator = allIndicators.find(indicator => indicator.id === id);
    console.log(indicator);
  }
}
