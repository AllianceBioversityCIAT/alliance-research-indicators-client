import { Component, inject, effect, EffectRef } from '@angular/core';
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
  route = inject(ActivatedRoute);
  versionWatcher = inject(VersionWatcherService);
  versionChangeEffect: EffectRef | undefined;
  lastVersion: string | null = null;
  lastId: number | null = null;

  constructor() {
    // Synchronize the global ID with the active route
    effect(() => {
      const id = Number(this.route.snapshot.params['id']);
      if (id > 0) {
        this.cache.currentResultId.set(id);
      }
    });

    // Control the metadata update only if id or version changes
    this.versionChangeEffect = effect(() => {
      this.checkAndUpdateMetadata();
    });
  }

  checkAndUpdateMetadata() {
    const version = this.versionWatcher.version();
    const id = this.cache.currentResultId();
    this.metadata.update(id);
    if (id > 0 && (this.lastVersion !== version || this.lastId !== id)) {
      this.metadata.update(id);
      this.lastVersion = version;
      this.lastId = id;
    }
  }
}
