import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { ResultSidebarComponent } from '../../../../shared/components/result-sidebar/result-sidebar.component';
import { CacheService } from '../../../../shared/services/cache/cache.service';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [RouterOutlet, ResultSidebarComponent],
  templateUrl: './result.component.html',
  styleUrl: './result.component.scss'
})
export default class ResultComponent {
  cache = inject(CacheService);
  resultId = Number(inject(ActivatedRoute).snapshot.params['id']);

  constructor() {
    this.cache.currentResultId.set(this.resultId);
  }
}
