import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import GeographicScopeComponent from './geographic-scope.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ApiService } from '../../../../../../shared/services/api.service';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { Router } from '@angular/router';
import { SubmissionService } from '@shared/services/submission.service';
import { VersionWatcherService } from '@shared/services/version-watcher.service';
import { MultiselectInstanceComponent } from '../../../../../../shared/components/custom-fields/multiselect-instance/multiselect-instance.component';
import { signal } from '@angular/core';

class ApiServiceMock {
  GET_GeoLocation = jest.fn().mockResolvedValue({ data: { countries: [] } });
  PATCH_GeoLocation = jest.fn().mockResolvedValue({ successfulRequest: true });
}
class CacheServiceMock {
  currentResultId = jest.fn().mockReturnValue(1);
  currentMetadata = jest.fn().mockReturnValue({ result_title: 'Test Title' });
  currentResultIsLoading = jest.fn().mockReturnValue(false);
  showSectionHeaderActions = jest.fn().mockReturnValue(false);
  isSidebarCollapsed = jest.fn().mockReturnValue(false);
}
class ActionsServiceMock {
  showToast = jest.fn();
}
class RouterMock {
  navigate = jest.fn();
}
class SubmissionServiceMock {
  isEditableStatus = jest.fn().mockReturnValue(true);
}
class VersionWatcherServiceMock {
  onVersionChange = jest.fn();
}

describe('GeographicScopeComponent', () => {
  let component: GeographicScopeComponent;
  let fixture: ComponentFixture<GeographicScopeComponent>;
  let api: ApiServiceMock;
  let cache: CacheServiceMock;
  let actions: ActionsServiceMock;
  let router: RouterMock;
  let submission: SubmissionServiceMock;
  let route: ActivatedRoute;

  beforeEach(async () => {
    api = new ApiServiceMock();
    cache = new CacheServiceMock();
    actions = new ActionsServiceMock();
    router = new RouterMock();
    submission = new SubmissionServiceMock();
    route = { snapshot: { queryParamMap: { get: (k: string) => (k === 'version' ? 'v1' : null) } } } as unknown as ActivatedRoute;
    await TestBed.configureTestingModule({
      imports: [GeographicScopeComponent],
      providers: [
        { provide: ApiService, useValue: api },
        { provide: CacheService, useValue: cache },
        { provide: ActionsService, useValue: actions },
        { provide: Router, useValue: router },
        { provide: SubmissionService, useValue: submission },
        { provide: VersionWatcherService, useClass: VersionWatcherServiceMock },
        { provide: ActivatedRoute, useValue: route }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(GeographicScopeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getData and set body', async () => {
    api.GET_GeoLocation.mockResolvedValueOnce({ data: { countries: [{ result_countries_sub_nationals: [{ sub_national: { name: 'Test' } }] }] } });
    await component.getData();
    expect(api.GET_GeoLocation).toHaveBeenCalled();
    expect(component.body().countries?.[0].result_countries_sub_nationals?.[0].name).toBe('Test');
    expect(component.loading()).toBe(false);
  });

  it('should call PATCH_GeoLocation and show toast on saveData', async () => {
    api.PATCH_GeoLocation.mockResolvedValueOnce({ successfulRequest: true });
    jest.spyOn(component, 'getData').mockResolvedValue(undefined);
    await component.saveData();
    expect(api.PATCH_GeoLocation).toHaveBeenCalled();
    expect(actions.showToast).toHaveBeenCalled();
    expect(component.loading()).toBe(false);
  });

  it('should not call showToast if PATCH_GeoLocation fails', async () => {
    api.PATCH_GeoLocation.mockResolvedValueOnce({ successfulRequest: false });
    await component.saveData();
    expect(actions.showToast).not.toHaveBeenCalled();
    expect(component.loading()).toBe(false);
  });

  it('should navigate to partners on saveData back', async () => {
    api.PATCH_GeoLocation.mockResolvedValueOnce({ successfulRequest: true });
    jest.spyOn(component, 'getData').mockResolvedValue(undefined);
    await component.saveData('back');
    expect(router.navigate).toHaveBeenCalledWith(['result', 1, 'partners'], { queryParams: { version: 'v1' }, replaceUrl: true });
  });

  it('should navigate to evidence on saveData next', async () => {
    api.PATCH_GeoLocation.mockResolvedValueOnce({ successfulRequest: true });
    jest.spyOn(component, 'getData').mockResolvedValue(undefined);
    await component.saveData('next');
    expect(router.navigate).toHaveBeenCalledWith(['result', 1, 'evidence'], { queryParams: { version: 'v1' }, replaceUrl: true });
  });

  it('should not PATCH if not editable', async () => {
    submission.isEditableStatus.mockReturnValue(false);
    await component.saveData();
    expect(api.PATCH_GeoLocation).not.toHaveBeenCalled();
  });

  it('should update country regions', () => {
    component.body.set({
      countries: [{ isoAlpha2: 'CO', result_countries_sub_nationals: [], result_countries_sub_nationals_signal: signal({ regions: [] }) }]
    });
    component.updateCountryRegions('CO', [{ sub_national_id: 1, region_id: 10, name: 'Region1' } as any]);
    expect(component.body().countries?.[0].result_countries_sub_nationals?.[0].name).toBe('Region1');
  });

  it('should remove subnational region and sync selector', () => {
    const setMock = jest.fn();
    const removeRegionByIdMock = jest.fn();
    const signalMock = Object.assign(() => ({ regions: [{ sub_national_id: 1, region_id: 10 }] }), {
      set: setMock,
      update: jest.fn(),
      asReadonly: jest.fn()
    });
    component.body.set({
      countries: [
        {
          isoAlpha2: 'CO',
          result_countries_sub_nationals_signal: signalMock as any,
          result_countries_sub_nationals: [{ sub_national_id: 1, region_id: 10 }]
        }
      ]
    });
    component.multiselectInstances = [{ endpointParams: { isoAlpha2: 'CO' }, removeRegionById: removeRegionByIdMock }] as any;
    component.removeSubnationalRegion({ isoAlpha2: 'CO' } as any, { sub_national_id: 1, region_id: 10 } as any);
    expect(setMock).toHaveBeenCalled();
    expect(removeRegionByIdMock).toHaveBeenCalledWith(1);
  });

  it('should return true for isArray with array', () => {
    expect(component.isArray([1, 2, 3])).toBe(true);
  });
  it('should return false for isArray with non-array', () => {
    expect(component.isArray('not-array')).toBe(false);
  });

  it('should compute isRegionsRequired, isCountriesRequired, isSubNationalRequired', () => {
    component.body.set({ geo_scope_id: 2 });
    expect(component.isRegionsRequired()).toBe(true);
    component.body.set({ geo_scope_id: 4 });
    expect(component.isCountriesRequired()).toBe(true);
    component.body.set({ geo_scope_id: 5 });
    expect(component.isSubNationalRequired()).toBe(true);
  });

  it('should compute showSubnationalError', () => {
    const signalMock = Object.assign(() => ({ regions: [] }), { set: jest.fn(), update: jest.fn(), asReadonly: jest.fn() });
    component.body.set({
      geo_scope_id: 5,
      countries: [{ isoAlpha2: 'CO', result_countries_sub_nationals: [], result_countries_sub_nationals_signal: signalMock as any }]
    });
    expect(component.showSubnationalError()).toBe(true);
    component.body.set({
      geo_scope_id: 4,
      countries: [{ isoAlpha2: 'CO', result_countries_sub_nationals: [], result_countries_sub_nationals_signal: signalMock as any }]
    });
    expect(component.showSubnationalError()).toBe(false);
  });

  it('should call onSelect and update isFirstSelect', () => {
    component.body.set({ geo_scope_id: 5, countries: [] });
    (component as any).isFirstSelect = false;
    component.onSelect();
    expect((component as any).isFirstSelect).toBe(false);
  });

  it('should call mapSignal and mapArray', () => {
    const signalMock = Object.assign(() => ({ regions: [{ sub_national_id: 1, region_id: 10 }] }), {
      set: jest.fn(),
      update: jest.fn(),
      asReadonly: jest.fn()
    });
    component.body.set({
      countries: [
        {
          isoAlpha2: 'CO',
          result_countries_sub_nationals: [{ sub_national_id: 1, region_id: 10 }],
          result_countries_sub_nationals_signal: signalMock as any
        }
      ]
    });
    component.mapSignal();
    component.mapArray();
    expect(component.body().countries?.[0].result_countries_sub_nationals).toBeDefined();
  });

  it('should not show toast or call getData if PATCH is not successful', async () => {
    api.PATCH_GeoLocation.mockResolvedValue({ successfulRequest: false });
    jest.spyOn(component, 'getData').mockResolvedValue();
    await component.saveData();
    expect(actions.showToast).not.toHaveBeenCalled();
    expect(component.getData).not.toHaveBeenCalled();
  });

  it('should navigate to back page', async () => {
    api.PATCH_GeoLocation.mockResolvedValue({ successfulRequest: true });
    jest.spyOn(component, 'getData').mockResolvedValue();
    await component.saveData('back');
    expect(router.navigate).toHaveBeenCalledWith(['result', 1, 'partners'], expect.any(Object));
  });

  it('should navigate to next page', async () => {
    api.PATCH_GeoLocation.mockResolvedValue({ successfulRequest: true });
    jest.spyOn(component, 'getData').mockResolvedValue();
    await component.saveData('next');
    expect(router.navigate).toHaveBeenCalledWith(['result', 1, 'evidence'], expect.any(Object));
  });

  it('should use version in queryParams if present', async () => {
    route.snapshot.queryParamMap.get = (key: string) => (key === 'version' ? 'v1' : null);
    api.PATCH_GeoLocation.mockResolvedValue({ successfulRequest: true });
    jest.spyOn(component, 'getData').mockResolvedValue();
    await component.saveData('next');
    expect(router.navigate).toHaveBeenCalledWith(['result', 1, 'evidence'], { queryParams: { version: 'v1' }, replaceUrl: true });
  });

  it('should not use version in queryParams if not present', async () => {
    route.snapshot.queryParamMap.get = () => null;
    api.PATCH_GeoLocation.mockResolvedValue({ successfulRequest: true });
    jest.spyOn(component, 'getData').mockResolvedValue();
    await component.saveData('next');
    expect(router.navigate).toHaveBeenCalledWith(['result', 1, 'evidence'], { queryParams: undefined, replaceUrl: true });
  });

  it('should handle getData with empty countries and sub_national undefined', async () => {
    api.GET_GeoLocation.mockResolvedValue({ data: { countries: [{ result_countries_sub_nationals: [{}] }] } });
    await component.getData();
    expect(component.body().countries?.[0].result_countries_sub_nationals?.[0].name).toBe('');
  });

  it('should handle getData with no countries', async () => {
    api.GET_GeoLocation.mockResolvedValue({ data: {} });
    await component.getData();
    expect(component.body()).toEqual({});
  });

  it('should not throw if removeSubnationalRegion called with no signal', () => {
    const country = { isoAlpha2: 'CO', result_countries_sub_nationals: [], result_countries_sub_nationals_signal: undefined } as any;
    const region = { sub_national_id: 1 } as any;
    expect(() => component.removeSubnationalRegion(country, region)).not.toThrow();
  });

  it('should not throw if removeSubnationalRegion called with no set', () => {
    const country = { isoAlpha2: 'CO', result_countries_sub_nationals: [], result_countries_sub_nationals_signal: () => ({ regions: [] }) } as any;
    const region = { sub_national_id: 1 } as any;
    expect(() => component.removeSubnationalRegion(country, region)).not.toThrow();
  });

  it('should handle mapSignal with non-array result_countries_sub_nationals', () => {
    const signalMock = Object.assign(() => ({ regions: [] }), { set: jest.fn(), update: jest.fn(), asReadonly: jest.fn() });
    component.body.set({
      countries: [{ isoAlpha2: 'CO', result_countries_sub_nationals: undefined as any, result_countries_sub_nationals_signal: signalMock as any }]
    });
    expect(() => component.mapSignal()).not.toThrow();
  });

  it('should handle mapSignal with no signal property', () => {
    const signalMock = Object.assign(() => ({ regions: [] }), { set: jest.fn(), update: jest.fn(), asReadonly: jest.fn() });
    component.body.set({
      countries: [{ isoAlpha2: 'CO', result_countries_sub_nationals: [], result_countries_sub_nationals_signal: signalMock as any }]
    });
    expect(() => component.mapSignal()).not.toThrow();
  });

  it('should handle mapArray with empty regions', () => {
    const signalMock = Object.assign(() => ({}), { set: jest.fn(), update: jest.fn(), asReadonly: jest.fn() });
    component.body.set({
      countries: [{ isoAlpha2: 'CO', result_countries_sub_nationals: [], result_countries_sub_nationals_signal: signalMock as any }]
    });
    expect(() => component.mapArray()).not.toThrow();
  });

  it('should showSubnationalError return false if scope is not 5', () => {
    const signalMock = Object.assign(() => ({ regions: [] }), { set: jest.fn(), update: jest.fn(), asReadonly: jest.fn() });
    component.body.set({
      geo_scope_id: 4,
      countries: [{ isoAlpha2: 'CO', result_countries_sub_nationals: [], result_countries_sub_nationals_signal: signalMock as any }]
    });
    expect(component.showSubnationalError()).toBe(false);
  });

  it('should showSubnationalError return true if country has no regions', () => {
    const signalMock = Object.assign(() => ({ regions: [] }), { set: jest.fn(), update: jest.fn(), asReadonly: jest.fn() });
    component.body.set({
      geo_scope_id: 5,
      countries: [{ isoAlpha2: 'CO', result_countries_sub_nationals: [], result_countries_sub_nationals_signal: signalMock as any }]
    });
    expect(component.showSubnationalError()).toBe(true);
  });

  it('should showSubnationalError return false if country has regions', () => {
    const signalMock = Object.assign(() => ({ regions: [{ sub_national_id: 1, region_id: 10 }] }), {
      set: jest.fn(),
      update: jest.fn(),
      asReadonly: jest.fn()
    });
    component.body.set({
      geo_scope_id: 5,
      countries: [
        {
          isoAlpha2: 'CO',
          result_countries_sub_nationals: [{ sub_national_id: 1, region_id: 10 }],
          result_countries_sub_nationals_signal: signalMock as any
        }
      ]
    });
    expect(component.showSubnationalError()).toBe(false);
  });

  it('should getMultiselectLabel for all cases', () => {
    component.body.set({ geo_scope_id: 1 });
    expect(component.getMultiselectLabel().country.label).toContain('countries');
    component.body.set({ geo_scope_id: 2 });
    expect(component.getMultiselectLabel().region.label).toContain('regions');
    component.body.set({ geo_scope_id: 4 });
    expect(component.getMultiselectLabel().country.label).toContain('countries');
    component.body.set({ geo_scope_id: 5 });
    expect(component.getMultiselectLabel().country.label).toContain('countries');
    component.body.set({ geo_scope_id: 99 });
    expect(component.getMultiselectLabel().country.label).toBe('');
  });
});
