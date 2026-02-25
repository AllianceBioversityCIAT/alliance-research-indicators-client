import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TableFiltersSidebarComponent } from './table-filters-sidebar.component';
import { ResultsCenterService } from '../../results-center.service';
import { PlatformSourceFilter } from '@shared/interfaces/platform-source-filter.interface';

describe('TableFiltersSidebarComponent', () => {
  let component: TableFiltersSidebarComponent;
  let fixture: ComponentFixture<TableFiltersSidebarComponent>;
  let resultsCenterService: ResultsCenterService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableFiltersSidebarComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TableFiltersSidebarComponent);
    component = fixture.componentInstance;
    resultsCenterService = TestBed.inject(ResultsCenterService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('indicatorOptionFilter', () => {
    it('should return true when indicator is null', () => {
      expect(component.indicatorOptionFilter(null)).toBe(true);
    });

    it('should return true when indicator_id is null', () => {
      expect(component.indicatorOptionFilter({ indicator_id: null })).toBe(true);
    });

    it('should return true when indicator_id is undefined', () => {
      expect(component.indicatorOptionFilter({ indicator_id: undefined })).toBe(true);
    });

    it('should return true when indicator_id is NaN', () => {
      expect(component.indicatorOptionFilter({ indicator_id: 'not-a-number' as any })).toBe(true);
    });

    it('should return false when indicator_id is in hiddenIds', () => {
      component.indicatorHiddenIds = [1, 2, 3];
      expect(component.indicatorOptionFilter({ indicator_id: 1 })).toBe(false);
    });

    it('should return true when indicator_id is not in hiddenIds', () => {
      component.indicatorHiddenIds = [1, 2, 3];
      expect(component.indicatorOptionFilter({ indicator_id: 4 })).toBe(true);
    });
  });

  describe('toggleSidebar', () => {
    it('should toggle showSignal from false to true', () => {
      const showSignal = component.showSignal;
      showSignal.set(false);
      component.toggleSidebar();
      expect(showSignal()).toBe(true);
    });

    it('should toggle showSignal from true to false', () => {
      const showSignal = component.showSignal;
      showSignal.set(true);
      component.toggleSidebar();
      expect(showSignal()).toBe(false);
    });
  });

  describe('effect syncing selectedSourceCodes from tableFilters', () => {
    it('should update selectedSourceCodes when tableFilters.sources changes', () => {
      const sources: PlatformSourceFilter[] = [
        { platform_code: 'STAR', name: 'STAR' },
        { platform_code: 'PRMS', name: 'PRMS' }
      ];
      resultsCenterService.tableFilters.update(prev => ({ ...prev, sources }));
      fixture.detectChanges();
      expect(component.selectedSourceCodes).toEqual(['STAR', 'PRMS']);
    });

    it('should not overwrite selectedSourceCodes when already in sync with tableFilters.sources', () => {
      const sources: PlatformSourceFilter[] = [{ platform_code: 'STAR', name: 'STAR' }];
      resultsCenterService.tableFilters.update(prev => ({ ...prev, sources }));
      fixture.detectChanges();
      expect(component.selectedSourceCodes).toEqual(['STAR']);
      component.selectedSourceCodes = ['STAR'];
      resultsCenterService.tableFilters.update(prev => ({ ...prev, sources }));
      fixture.detectChanges();
      expect(component.selectedSourceCodes).toEqual(['STAR']);
    });
  });

  describe('ngAfterViewInit', () => {
    it('should sync selectedSourceCodes from service and set multiselectRefs', () => {
      const sources: PlatformSourceFilter[] = [{ platform_code: 'TIP', name: 'TIP' }];
      resultsCenterService.tableFilters.update(prev => ({ ...prev, sources }));
      component.ngAfterViewInit();
      expect(component.selectedSourceCodes).toEqual(['TIP']);
      expect(resultsCenterService.multiselectRefs()).toBeDefined();
      expect(Object.keys(resultsCenterService.multiselectRefs())).toEqual(['indicator', 'status', 'project', 'lever', 'year']);
    });
  });

  describe('onSourceChange', () => {
    it('should set selectedSourceCodes and update service when value is string[]', () => {
      component.onSourceChange(['STAR', 'PRMS']);
      expect(component.selectedSourceCodes).toEqual(['STAR', 'PRMS']);
      expect(resultsCenterService.tableFilters().sources.map(s => s.platform_code)).toEqual(['STAR', 'PRMS']);
    });

    it('should set selectedSourceCodes and update service when value is PlatformSourceFilter[]', () => {
      const value: PlatformSourceFilter[] = [{ platform_code: 'TIP', name: 'TIP' }];
      component.onSourceChange(value);
      expect(component.selectedSourceCodes).toEqual(['TIP']);
      expect(resultsCenterService.tableFilters().sources.map(s => s.platform_code)).toEqual(['TIP']);
    });

    it('should clear selectedSourceCodes and sources when value is empty array', () => {
      component.selectedSourceCodes = ['STAR'];
      component.onSourceChange([]);
      expect(component.selectedSourceCodes).toEqual([]);
      expect(resultsCenterService.tableFilters().sources).toEqual([]);
    });

    it('should handle non-array value by clearing selection', () => {
      component.selectedSourceCodes = ['STAR'];
      component.onSourceChange(null as any);
      expect(component.selectedSourceCodes).toEqual([]);
      expect(resultsCenterService.tableFilters().sources).toEqual([]);
    });
  });
});
