import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { ResultSidebarComponent } from '../../../../shared/components/result-sidebar/result-sidebar.component';
import { CacheService } from '../../../../shared/services/cache/cache.service';
import { GetMetadataService } from '../../../../shared/services/get-metadata.service';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [RouterOutlet, ResultSidebarComponent],
  templateUrl: './result.component.html',
  styleUrl: './result.component.scss'
})
export default class ResultComponent {
  cache = inject(CacheService);
  metadata = inject(GetMetadataService);
  resultId = Number(inject(ActivatedRoute).snapshot.params['id']);

  constructor() {
    this.cache.currentResultId.set(this.resultId);
    this.metadata.GET_Metadata(this.resultId);
  }
}
