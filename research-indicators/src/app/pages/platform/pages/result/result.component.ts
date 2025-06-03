import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { ResultSidebarComponent } from '../../../../shared/components/result-sidebar/result-sidebar.component';
import { CacheService } from '../../../../shared/services/cache/cache.service';
import { GetMetadataService } from '../../../../shared/services/get-metadata.service';
import { SubmissionHistoryContentComponent } from './components/submission-history-content/submission-history-content.component';
import { SectionSidebarComponent } from '../../../../shared/components/section-sidebar/section-sidebar.component';
import { VersionWatcherService } from '@shared/services/version-watcher.service';

@Component({
  selector: 'app-result',
  imports: [RouterOutlet, ResultSidebarComponent, SubmissionHistoryContentComponent, SectionSidebarComponent],
  templateUrl: './result.component.html',
  styleUrl: './result.component.scss'
})
export default class ResultComponent {
  cache = inject(CacheService);
  metadata = inject(GetMetadataService);
  resultId = Number(inject(ActivatedRoute).snapshot.params['id']);
  versionWatcher = inject(VersionWatcherService);

  constructor() {
    this.cache.currentResultId.set(this.resultId);
    this.metadata.update(this.resultId);

    this.versionWatcher.onVersionChange(() => {
      this.metadata.update(this.resultId);
    });
  }
}
