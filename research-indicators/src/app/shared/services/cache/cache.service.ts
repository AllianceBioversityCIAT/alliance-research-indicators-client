import { computed, Injectable, signal, WritableSignal } from '@angular/core';
import { DataCache } from '@interfaces/cache.interface';
import { GetMetadata } from '../../interfaces/get-metadata.interface';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  //user
  isLoggedIn = signal(false);
  isValidatingToken = signal(false);
  dataCache: WritableSignal<DataCache> = signal(localStorage.getItem('data') ? JSON.parse(localStorage.getItem('data') ?? '') : {});
  showMetadataPanel = signal(localStorage.getItem('showMetadataPanel') === 'true');
  currentSectionHeaderName = signal('');
  currentResultId: WritableSignal<number> = signal(0);
  currentResultIsLoading = signal(false);
  currentMetadata: WritableSignal<GetMetadata> = signal({});
  loadingCurrentResult = signal(false);
  currentResultIndicatorSectionPath = computed(() => {
    switch (this.currentMetadata().indicator_id) {
      case 1:
        return 'capacity-sharing';
      case 4:
        return 'policy-change';
      default:
        return '';
    }
  });
  isSidebarCollapsed = signal(localStorage.getItem('isSidebarCollapsed') === 'true');

  setCurrentSectionHeaderName(name: string) {
    this.currentSectionHeaderName.set(name);
  }

  toggleSidebar() {
    this.isSidebarCollapsed.update(isCollapsed => !isCollapsed);
    localStorage.setItem('isSidebarCollapsed', this.isSidebarCollapsed().toString());
  }
}
