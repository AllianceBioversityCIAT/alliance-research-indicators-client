import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@shared/services/api.service';
import { GetIndicatorsProgress } from '../../../../../shared/interfaces/get-indicators-progress.interface';

@Component({
  selector: 'app-indicators-progress',
  imports: [],
  templateUrl: './indicators-progress.component.html',
  styleUrl: './indicators-progress.component.scss'
})
export default class IndicatorsProgressComponent implements OnInit {
  api = inject(ApiService);
  route = inject(ActivatedRoute);

  ngOnInit() {
    this.GET_IndicatorsProgress();
  }

  GET_IndicatorsProgress() {
    this.api.GET_IndicatorsProgress(this.route.snapshot.params['id']).then(res => {
      console.log(res.data);
      res.data.map(indicator => {
        indicator.base_line = Number(indicator.base_line);
        indicator.target_value = Number(indicator.target_value);
        indicator.total_contributions = 0;
        console.log(indicator.number_type);
        indicator.contributions.map(contribution => {
          contribution.contribution_value = Number(contribution.contribution_value);
          if (indicator.number_type === 'sum') {
            indicator.total_contributions += contribution.contribution_value;
          } else if (indicator.number_type === 'average') {
            indicator.total_contributions += contribution.contribution_value / indicator.contributions.length;
          } else if (indicator.number_type === 'count') {
            indicator.total_contributions += 1;
          }
        });
      });
      /* TODO:
       - contribution_value to number
       - base_line to number
       - target_value to number
       - baseline 10 target value 20 entonces faltan 10
       - dependiendo de number_type, se hace sum, average, count, yes, no



      */

      console.log(res.data);
    });
  }
}
