import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import OicrDetailsComponent from './oicr-details.component';
import { CacheService } from '@shared/services/cache/cache.service';
import { ApiService } from '@shared/services/api.service';
import { SubmissionService } from '@shared/services/submission.service';
import { ActionsService } from '@shared/services/actions.service';
import { VersionWatcherService } from '@shared/services/version-watcher.service';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { RolesService } from '@shared/services/cache/roles.service';
import { ServiceLocatorService } from '@shared/services/service-locator.service';
import { ContactPersonResponse } from '@shared/interfaces/contact-person.interface';

describe('OicrDetailsComponent', () => {
  let component: OicrDetailsComponent;
  let fixture: ComponentFixture<OicrDetailsComponent>;

  let cacheService: jest.Mocked<CacheService>;
  let apiService: jest.Mocked<ApiService>;
  let submissionService: jest.Mocked<SubmissionService>;
  let actionsService: jest.Mocked<ActionsService>;
  let versionWatcher: jest.Mocked<VersionWatcherService>;
  let allModalsService: jest.Mocked<AllModalsService>;
  let router: jest.Mocked<Router>;

  beforeEach(async () => {
    const mockCacheService: jest.Mocked<CacheService> = {
      getCurrentNumericResultId: jest.fn().mockReturnValue(1),
      currentResultId: jest.fn().mockReturnValue('1')
      // @ts-expect-error partial mock
    } as jest.Mocked<CacheService>;

    const mockApiService: jest.Mocked<ApiService> = {
      GET_AutorContact: jest.fn(),
      DELETE_AutorContact: jest.fn(),
      POST_AutorContact: jest.fn(),
      GET_Oicr: jest.fn(),
      PATCH_Oicr: jest.fn()
      // @ts-expect-error partial mock
    } as jest.Mocked<ApiService>;

    const mockSubmissionService: jest.Mocked<SubmissionService> = {
      isEditableStatus: jest.fn().mockReturnValue(true)
      // @ts-expect-error partial mock
    } as jest.Mocked<SubmissionService>;

    const mockActionsService: jest.Mocked<ActionsService> = {
      showToast: jest.fn()
      // @ts-expect-error partial mock
    } as jest.Mocked<ActionsService>;

    const mockVersionWatcher: jest.Mocked<VersionWatcherService> = {
      onVersionChange: jest.fn()
      // @ts-expect-error partial mock
    } as jest.Mocked<VersionWatcherService>;

    const mockAllModalsService: jest.Mocked<AllModalsService> = {
      toggleModal: jest.fn(),
      setAddContactPersonConfirm: jest.fn(),
      setDisabledAddContactPerson: jest.fn()
      // @ts-expect-error partial mock
    } as jest.Mocked<AllModalsService>;

    const mockRolesService: jest.Mocked<RolesService> = {
      isAdmin: jest.fn().mockReturnValue(true)
      // @ts-expect-error partial mock
    } as jest.Mocked<RolesService>;

    const mockRouter: jest.Mocked<Router> = {
      navigate: jest.fn()
      // @ts-expect-error partial mock
    } as jest.Mocked<Router>;

    const mockActivatedRoute: Partial<ActivatedRoute> = {
      snapshot: {
        // @ts-expect-error minimal queryParamMap mock
        queryParamMap: { get: jest.fn().mockReturnValue(null) }
      } as any
    };

    const mockServiceLocator: jest.Mocked<ServiceLocatorService> = {
      getService: jest.fn()
      // @ts-expect-error partial mock
    } as jest.Mocked<ServiceLocatorService>;

    // No necesitamos el template y así evitamos cargar todos los hijos
    TestBed.overrideComponent(OicrDetailsComponent, { set: { template: '' } });

    await TestBed.configureTestingModule({
      imports: [OicrDetailsComponent],
      providers: [
        { provide: CacheService, useValue: mockCacheService },
        { provide: ApiService, useValue: mockApiService },
        { provide: SubmissionService, useValue: mockSubmissionService },
        { provide: ActionsService, useValue: mockActionsService },
        { provide: VersionWatcherService, useValue: mockVersionWatcher },
        { provide: AllModalsService, useValue: mockAllModalsService },
        { provide: RolesService, useValue: mockRolesService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ServiceLocatorService, useValue: mockServiceLocator }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OicrDetailsComponent);
    component = fixture.componentInstance;

    cacheService = TestBed.inject(CacheService) as jest.Mocked<CacheService>;
    apiService = TestBed.inject(ApiService) as jest.Mocked<ApiService>;
    submissionService = TestBed.inject(SubmissionService) as jest.Mocked<SubmissionService>;
    actionsService = TestBed.inject(ActionsService) as jest.Mocked<ActionsService>;
    versionWatcher = TestBed.inject(VersionWatcherService) as jest.Mocked<VersionWatcherService>;
    allModalsService = TestBed.inject(AllModalsService) as jest.Mocked<AllModalsService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
  });

  it('should create and setup modal + version watcher', () => {
    expect(component).toBeTruthy();
    expect(allModalsService.setAddContactPersonConfirm).toHaveBeenCalled();
    expect(allModalsService.setDisabledAddContactPerson).toHaveBeenCalled();
    expect(versionWatcher.onVersionChange).toHaveBeenCalled();
  });

  it('version change callback should call getData', () => {
    const getDataSpy = jest.spyOn(component, 'getData').mockResolvedValue();
    const callback = (versionWatcher.onVersionChange as jest.Mock).mock.calls[0][0];
    callback();
    expect(getDataSpy).toHaveBeenCalled();
  });

  it('should pass isAddContactPersonDisabled to setDisabledAddContactPerson', () => {
    const setDisabled = allModalsService.setDisabledAddContactPerson as jest.Mock;
    const disabledCallback = setDisabled.mock.calls[0][0];
    submissionService.isEditableStatus.mockReturnValue(true);
    expect(disabledCallback()).toBe(false);
    submissionService.isEditableStatus.mockReturnValue(false);
    expect(disabledCallback()).toBe(true);
  });

  describe('quantifications handlers', () => {
    it('should add and remove quantification when editable', () => {
      submissionService.isEditableStatus.mockReturnValue(true);
      expect(component.quantifications().length).toBe(1);

      component.addQuantification();
      expect(component.quantifications().length).toBe(2);

      component.removeQuantification(0);
      expect(component.quantifications().length).toBe(1);
    });

    it('should not modify quantifications when not editable', () => {
      submissionService.isEditableStatus.mockReturnValue(false);
      const initialLength = component.quantifications().length;
      component.addQuantification();
      component.removeQuantification(0);
      expect(component.quantifications().length).toBe(initialLength);
    });

    it('should update quantification at index', () => {
      const data = { number: 10, unit: 'kg', comments: 'test' };
      component.updateQuantification(0, data);
      expect(component.quantifications()[0]).toEqual(data);
    });
  });

  describe('extrapolated estimates handlers', () => {
    it('should add and remove extrapolated estimate when editable', () => {
      submissionService.isEditableStatus.mockReturnValue(true);
      expect(component.extrapolatedEstimates().length).toBe(1);

      component.addExtrapolatedEstimate();
      expect(component.extrapolatedEstimates().length).toBe(2);

      component.removeExtrapolatedEstimate(0);
      expect(component.extrapolatedEstimates().length).toBe(1);
    });

    it('should not modify extrapolated estimates when not editable', () => {
      submissionService.isEditableStatus.mockReturnValue(false);
      const initialLength = component.extrapolatedEstimates().length;
      component.addExtrapolatedEstimate();
      component.removeExtrapolatedEstimate(0);
      expect(component.extrapolatedEstimates().length).toBe(initialLength);
    });

    it('should update extrapolated estimate at index', () => {
      const data = { number: 5, unit: 'ha', comments: 'extrapolated' };
      component.updateExtrapolatedEstimate(0, data);
      expect(component.extrapolatedEstimates()[0]).toEqual(data);
    });
  });

  describe('contact persons', () => {
    it('should open add contact person modal', () => {
      component.onAddContactPerson();
      expect(allModalsService.toggleModal).toHaveBeenCalledWith('addContactPerson');
    });

    it('should load and map contact persons from array response', async () => {
      const responseData: ContactPersonResponse[] = [
        {
          result_user_id: 1,
          user_id: 10,
          informative_role_id: 20,
          user: {
            first_name: 'John',
            last_name: 'Doe',
            position: 'Researcher',
            affiliation: 'Center A',
            email: 'john@example.com',
            center: 'Center A'
          } as any,
          informativeRole: { name: 'Lead' } as any
        } as any
      ];

      apiService.GET_AutorContact.mockResolvedValue({ data: responseData } as any);

      await component.loadContactPersons();

      const rows = component.contactPersons();
      expect(apiService.GET_AutorContact).toHaveBeenCalledWith(cacheService.getCurrentNumericResultId());
      expect(rows.length).toBe(1);
      expect(rows[0]).toMatchObject({
        id: 1,
        name: 'John Doe',
        position: 'Researcher',
        affiliation: 'Center A',
        email: 'john@example.com',
        role: 'Lead',
        user_id: 10,
        informative_role_id: 20
      });
    });

    it('should handle non-array contact persons response', async () => {
      const oneItem: ContactPersonResponse = {
        result_user_id: 2,
        user_id: 11,
        informative_role_id: 21,
        user: {
          first_name: 'Jane',
          last_name: 'Smith',
          position: undefined,
          affiliation: undefined,
          email: undefined,
          center: 'Center B'
        } as any,
        informativeRole: undefined as any
      } as any;

      apiService.GET_AutorContact.mockResolvedValue({ data: oneItem } as any);

      await component.loadContactPersons();

      const rows = component.contactPersons();
      expect(rows[0]).toMatchObject({
        id: 2,
        name: 'Jane Smith',
        position: '-',
        affiliation: 'Center B',
        email: '-',
        role: '-'
      });
    });

    it('should clear contact persons when response has no data', async () => {
      apiService.GET_AutorContact.mockResolvedValue({ data: null } as any);
      await component.loadContactPersons();
      expect(component.contactPersons()).toEqual([]);
    });

    it('should delete contact person and reload list on success', async () => {
      const row = { id: 5 } as any;
      apiService.DELETE_AutorContact.mockResolvedValue({ successfulRequest: true } as any);
      const loadSpy = jest.spyOn(component, 'loadContactPersons').mockResolvedValue();

      await component.onDeleteContactPerson(row);

      expect(apiService.DELETE_AutorContact).toHaveBeenCalledWith(5, cacheService.getCurrentNumericResultId());
      expect(loadSpy).toHaveBeenCalled();
      expect(actionsService.showToast).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Contact person',
        detail: 'Deleted successfully'
      });
    });

    it('should not delete contact person if row has no id', async () => {
      await component.onDeleteContactPerson({} as any);
      expect(apiService.DELETE_AutorContact).not.toHaveBeenCalled();
    });
  });

  describe('modal actions and validation', () => {
    it('should disable add contact person when not editable', () => {
      submissionService.isEditableStatus.mockReturnValue(false);
      expect(component.isAddContactPersonDisabled()).toBe(true);
    });

    it('should handle invalid data on confirm add contact person', async () => {
      await component.onConfirmAddContactPerson({ contact_person_id: undefined, role_id: undefined } as any);
      expect(actionsService.showToast).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Please select both contact person and role'
      });
      expect(apiService.POST_AutorContact).not.toHaveBeenCalled();
    });

    it('should add contact person and close modal on success', async () => {
      const data = { contact_person_id: 99, role_id: 7 } as any;
      apiService.POST_AutorContact.mockResolvedValue({} as any);
      const loadSpy = jest.spyOn(component, 'loadContactPersons').mockResolvedValue();

      await component.onConfirmAddContactPerson(data);

      expect(apiService.POST_AutorContact).toHaveBeenCalledWith(
        { user_id: 99, informative_role_id: 7 },
        cacheService.getCurrentNumericResultId()
      );
      expect(loadSpy).toHaveBeenCalled();
      expect(actionsService.showToast).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Contact person',
        detail: 'Added successfully'
      });
      expect(allModalsService.toggleModal).toHaveBeenCalledWith('addContactPerson');
    });

    it('should show error toast when add contact person fails', async () => {
      const data = { contact_person_id: 99, role_id: 7 } as any;
      apiService.POST_AutorContact.mockRejectedValue(new Error('fail'));

      await component.onConfirmAddContactPerson(data);

      expect(actionsService.showToast).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to add contact person'
      });
    });
  });

  describe('getData', () => {
    it('should map body, quantifications, extrapolated estimates and impact areas', async () => {
      const response = {
        data: {
          oicr_internal_code: 'OC-1',
          actual_count: [
            { quantification_number: '10', unit: 'kg', description: 'desc1' },
            { quantification_number: 5, unit: 'ha', description: 'desc2' }
          ],
          extrapolate_estimates: [{ quantification_number: '3', unit: 'kg', description: 'ext1' }],
          result_impact_areas: [
            { impact_area_id: 1, impact_area_score_id: 2, global_target_id: 3 },
            { impact_area_id: 4, impact_area_score_id: undefined, global_target_id: undefined }
          ]
        }
      } as any;

      apiService.GET_Oicr.mockResolvedValue(response);
      const loadContactsSpy = jest.spyOn(component, 'loadContactPersons').mockResolvedValue();

      await component.getData();

      expect(apiService.GET_Oicr).toHaveBeenCalledWith(cacheService.getCurrentNumericResultId());
      expect(loadContactsSpy).toHaveBeenCalled();

      expect(component.body().oicr_internal_code).toBe('OC-1');
      expect(component.quantifications().length).toBe(2);
      expect(component.quantifications()[0]).toEqual({ number: 10, unit: 'kg', comments: 'desc1' });
      expect(component.quantifications()[1]).toEqual({ number: 5, unit: 'ha', comments: 'desc2' });

      expect(component.extrapolatedEstimates().length).toBe(1);
      expect(component.extrapolatedEstimates()[0]).toEqual({ number: 3, unit: 'kg', comments: 'ext1' });

      expect(component.body().result_impact_areas?.length).toBe(2);
      expect(component.loading()).toBe(false);
    });

    it('should fallback to default quantification and extrapolated estimates when arrays are empty', async () => {
      apiService.GET_Oicr.mockResolvedValue({ data: {} } as any);
      const loadContactsSpy = jest.spyOn(component, 'loadContactPersons').mockResolvedValue();

      await component.getData();

      expect(loadContactsSpy).toHaveBeenCalled();
      expect(component.quantifications()).toEqual([{ number: null, unit: '', comments: '' }]);
      expect(component.extrapolatedEstimates()).toEqual([{ number: null, unit: '', comments: '' }]);
    });
  });

  describe('saveData', () => {
    it('should save data and stay on page when no navigation param', async () => {
      submissionService.isEditableStatus.mockReturnValue(true);
      apiService.PATCH_Oicr.mockResolvedValue({ successfulRequest: true } as any);
      const getDataSpy = jest.spyOn(component, 'getData').mockResolvedValue();

      component.quantifications.set([{ number: 1, unit: 'kg', comments: 'c1' }]);
      component.extrapolatedEstimates.set([{ number: 2, unit: 'ha', comments: 'c2' }]);

      await component.saveData();

      expect(apiService.PATCH_Oicr).toHaveBeenCalled();
      expect(getDataSpy).toHaveBeenCalled();
      expect(actionsService.showToast).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'OICR Details',
        detail: 'Data saved successfully'
      });
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should not proceed when PATCH_Oicr fails', async () => {
      submissionService.isEditableStatus.mockReturnValue(true);
      apiService.PATCH_Oicr.mockResolvedValue({ successfulRequest: false } as any);
      const getDataSpy = jest.spyOn(component, 'getData').mockResolvedValue();
      component.quantifications.set([{ number: 1, unit: 'kg', comments: 'q' }]);
      component.extrapolatedEstimates.set([{ number: 2, unit: 'ha', comments: 'e' }]);

      await component.saveData();

      expect(apiService.PATCH_Oicr).toHaveBeenCalledWith(
        expect.any(Number),
        expect.objectContaining({
          extrapolate_estimates: [{ quantification_number: 2, unit: 'ha', description: 'e' }]
        })
      );
      expect(getDataSpy).not.toHaveBeenCalled();
    });

    it('should navigate back and next with query params', async () => {
      submissionService.isEditableStatus.mockReturnValue(false);
      const route = TestBed.inject(ActivatedRoute) as ActivatedRoute;
      // @ts-expect-error override mock
      (route.snapshot.queryParamMap.get as any) = jest.fn().mockReturnValue('v1');

      await component.saveData('back');
      expect(router.navigate).toHaveBeenCalledWith(
        ['result', cacheService.currentResultId(), 'alliance-alignment'],
        { queryParams: { version: 'v1' }, replaceUrl: true }
      );

      await component.saveData('next');
      expect(router.navigate).toHaveBeenCalledWith(
        ['result', cacheService.currentResultId(), 'partners'],
        { queryParams: { version: 'v1' }, replaceUrl: true }
      );
    });
  });

  describe('clearOicrSelection', () => {
    it('should reset external_oicr_id to 0', () => {
      component.body.set({
        ...component.body(),
        link_result: { external_oicr_id: 123 }
      } as any);

      component.clearOicrSelection();

      expect(component.body().link_result.external_oicr_id).toBe(0);
    });
  });
});


