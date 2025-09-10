import { computed, Injectable, signal, WritableSignal } from '@angular/core';
import { DataCache } from '@interfaces/cache.interface';
import { GetMetadata } from '../../interfaces/get-metadata.interface';
import { GreenChecks } from '../../interfaces/get-green-checks.interface';
import { TransformResultCodeResponse } from '@shared/interfaces/get-transform-result-code.interface';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  //user
  isLoggedIn = signal(false);
  isValidatingToken = signal(false);
  dataCache: WritableSignal<DataCache> = signal(
    (() => {
      const raw = localStorage.getItem('data');
      if (!raw) return {};
      try {
        return JSON.parse(raw);
      } catch {
        return {};
      }
    })()
  );
  showMetadataPanel = signal(localStorage.getItem('showMetadataPanel') === 'true');
  currentSectionHeaderName = signal('');
  currentResultId: WritableSignal<number> = signal(0, {
    equal: (a, b) => {
      return a === b;
    }
  });
  currentResultIsLoading = signal(false);
  currentUrlPath = signal('');
  currentMetadata: WritableSignal<GetMetadata> = signal({});
  greenChecks = signal<GreenChecks>({});
  currentRouteTitle = signal('');
  showSectionHeaderActions = signal(false);
  lastResultId = signal<number | null>(null);
  lastVersionParam = signal<string | null>(null);
  versionsList = signal<TransformResultCodeResponse[]>([]);
  liveVersionData = signal<TransformResultCodeResponse | null>(null);
  allGreenChecksAreTrue = computed(() => Object.values(this.greenChecks()).every(check => check));
  isMyResult = computed(() => Number(this.currentMetadata().created_by) === Number(this.dataCache().user.sec_user_id));

  loadingCurrentResult = signal(false);
  navbarHeight = signal(0);
  headerHeight = signal(0);
  tableFiltersSidebarHeight = signal(0);
  windowWidth = signal(window.innerWidth);
  windowHeight = signal(window.innerHeight);
  hasSmallScreen = computed(() => this.windowHeight() < 768);
  showSubmissionHistory = signal(false);
  currentResultIndicatorSectionPath = computed(() => {
    switch (this.currentMetadata().indicator_id) {
      case 1:
        return 'capacity-sharing';
      case 2:
        return 'innovation-details';
      case 4:
        return 'policy-change';
      case 5:
        return 'oicr-details';
      default:
        return '';
    }
  });
  searchAResultValue = signal('');
  isSidebarCollapsed = signal(localStorage.getItem('isSidebarCollapsed') !== 'false');

  setCurrentSectionHeaderName(name: string) {
    this.currentSectionHeaderName.set(name);
  }

  /**
   * Establece el currentResultId extrayendo siempre solo el ID numérico
   * @param id - ID que puede venir como string (ej: "result.platform_code-2863") o número (ej: 2863)
   */
  setCurrentResultId(id: string | number): void {
    let numericId: number;

    if (typeof id === 'string' && id.includes('-')) {
      // Extraer el número después del último guión (formato: result.platform_code-2863)
      const parts = id.split('-');
      const lastPart = parts[parts.length - 1];
      numericId = parseInt(lastPart, 10);
    } else {
      // Si es un número directo o string numérico
      numericId = Number(id);
    }

    // Solo establecer si es un número válido
    if (numericId > 0 && !isNaN(numericId)) {
      this.currentResultId.set(numericId);
    }
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
