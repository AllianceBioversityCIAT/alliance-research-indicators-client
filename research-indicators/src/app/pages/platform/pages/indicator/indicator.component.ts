import { Component, inject, OnInit } from '@angular/core';
import { IndicatorsService } from '@services/indicators.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-indicator',
  standalone: true,
  imports: [],
  templateUrl: './indicator.component.html',
  styleUrl: './indicator.component.scss'
})
export default class IndicatorComponent implements OnInit {
  indicatorsSE = inject(IndicatorsService);

  route = inject(ActivatedRoute);

  ngOnInit() {
    const indicatorId = this.route.snapshot.paramMap.get('id')!;
    this.getIndicatorById(Number(indicatorId));
  }

  getIndicatorById(id: number) {
    const allIndicators = [...this.indicatorsSE.indicators().flatMap(item => item.indicators)];
    const indicator = allIndicators.find(indicator => indicator.indicator_id === id);
    console.log(allIndicators);
    console.log(indicator);
  }
}
