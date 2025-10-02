import { Component, inject, effect, EffectRef } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { ResultSidebarComponent } from '../../../../shared/components/result-sidebar/result-sidebar.component';
import { CacheService } from '../../../../shared/services/cache/cache.service';
import { GetMetadataService } from '../../../../shared/services/get-metadata.service';
import { SubmissionHistoryContentComponent } from './components/submission-history-content/submission-history-content.component';
import { SectionSidebarComponent } from '../../../../shared/components/section-sidebar/section-sidebar.component';
import { VersionWatcherService } from '@shared/services/version-watcher.service';
import { toSignal } from '@angular/core/rxjs-interop';

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

  routeParams = toSignal(this.route.params, { initialValue: {} });

  constructor() {
    effect(() => {
      const params = this.routeParams();
      const idParam = params && 'id' in params ? (params['id'] as string) : undefined;
      let id: number;

      if (typeof idParam === 'string' && idParam.includes('-')) {
        const parts = idParam.split('-');
        const lastPart = parts[parts.length - 1];
        id = parseInt(lastPart, 10);
      } else {
        id = Number(idParam);
      }

      if (id > 0 && !isNaN(id)) {
        this.cache.setCurrentResultId(this.getCurrentResultIdentifier(idParam, id));
      }
    });

    this.versionChangeEffect = effect(() => {
      this.checkAndUpdateMetadata();
    });
  }

  checkAndUpdateMetadata() {
    const version = this.versionWatcher.version();
    const id = this.cache.getCurrentNumericResultId();

    if (id > 0 && (this.lastVersion !== version || this.lastId !== id)) {
      this.metadata.update(id);
      this.lastVersion = version;
      this.lastId = id;
    }
  }

  protected getCurrentResultIdentifier(idParam: unknown, id: number): string | number {
    return (idParam as any) || id;
  }
}
