import { computed, Injectable, signal, WritableSignal } from '@angular/core';
import { DataCache } from '@interfaces/cache.interface';
import { GetMetadata } from '../../interfaces/get-metadata.interface';
import { GreenChecks } from '../../interfaces/get-green-checks.interface';

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
  currentUrlPath = signal('');
  currentMetadata: WritableSignal<GetMetadata> = signal({});
  greenChecks = signal<GreenChecks>({});
  currentRouteTitle = signal('');
  showSectionHeaderActions = signal(false);

  allGreenChecksAreTrue = computed(() => Object.values(this.greenChecks()).every(check => check));
  isMyResult = computed(() => Number(this.currentMetadata().created_by) === Number(this.dataCache().user.sec_user_id));

  loadingCurrentResult = signal(false);
  navbarHeight = signal(0);
  headerHeight = signal(0);
  tableFiltersSidebarHeight = signal(0);
  windowHeight = signal(window.innerHeight);
  hasSmallScreen = computed(() => this.windowHeight() < 768);
  showSubmissionHistory = signal(false);
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
  searchAResultValue = signal('');
  isSidebarCollapsed = signal(localStorage.getItem('isSidebarCollapsed') !== 'false');

  setCurrentSectionHeaderName(name: string) {
    this.currentSectionHeaderName.set(name);
  }

  toggleSidebar() {
    this.isSidebarCollapsed.update(isCollapsed => !isCollapsed);
    localStorage.setItem('isSidebarCollapsed', this.isSidebarCollapsed().toString());
  }

  collapseSidebar() {
    this.isSidebarCollapsed.set(true);
    localStorage.setItem('isSidebarCollapsed', 'true');
  }
}
