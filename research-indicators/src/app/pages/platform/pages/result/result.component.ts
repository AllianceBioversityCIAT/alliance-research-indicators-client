import { Component, inject, effect } from '@angular/core';
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
  versionChangeEffect: any;
  lastVersion: string | null = null;
  lastId: number | null = null;

  constructor() {
    // Sincroniza el ID global con la ruta activa
    effect(() => {
      const id = Number(this.route.snapshot.params['id']);
      if (id > 0) {
        this.cache.currentResultId.set(id);
      }
    });

    // Controla el update de metadata solo si cambia id o version
    this.versionChangeEffect = effect(() => {
      const version = this.versionWatcher.version();
      const id = this.cache.currentResultId();
      this.metadata.update(id);

      if (id > 0 && (this.lastVersion !== version || this.lastId !== id)) {
        this.metadata.update(id);
        this.lastVersion = version;
        this.lastId = id;
      }
    });
  }
}
