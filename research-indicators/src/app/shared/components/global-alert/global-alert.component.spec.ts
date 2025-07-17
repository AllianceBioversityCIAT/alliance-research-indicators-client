import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalAlertComponent } from './global-alert.component';
import { ActionsService } from '../../services/actions.service';
import { ServiceLocatorService } from '@shared/services/service-locator.service';
import { signal } from '@angular/core';
import { GlobalAlert } from '@shared/interfaces/global-alert.interface';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputComponent } from '../custom-fields/input/input.component';
import { apiServiceMock } from '../../../testing/mock-services.mock';

describe('GlobalAlertComponent', () => {
  let component: GlobalAlertComponent;
  let fixture: ComponentFixture<GlobalAlertComponent>;
  let actionsService: jest.Mocked<ActionsService>;
  let serviceLocator: jest.Mocked<ServiceLocatorService>;

  beforeEach(async () => {
    const mockActionsService = {
      globalAlertsStatus: signal<GlobalAlert[]>([]),
      hideGlobalAlert: jest.fn()
    };

    const mockServiceLocator = {
      getService: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [GlobalAlertComponent, FormsModule, ButtonModule, SelectModule, InputComponent],
      providers: [
        { provide: ActionsService, useValue: mockActionsService },
        { provide: ServiceLocatorService, useValue: mockServiceLocator }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalAlertComponent);
    component = fixture.componentInstance;
    actionsService = TestBed.inject(ActionsService) as jest.Mocked<ActionsService>;
    serviceLocator = TestBed.inject(ServiceLocatorService) as jest.Mocked<ServiceLocatorService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle different severity icons', () => {
    const severities = ['success', 'confirm', 'warning', 'secondary', 'error', 'info'] as const;

    severities.forEach(severity => {
      const result = component.getIcon(severity);
      expect(result).toHaveProperty('icon');
      expect(result).toHaveProperty('color');
    });
  });

  it('should validate isInvalid correctly', () => {
    component.body = signal({ commentValue: '', selectValue: null });
    expect(component.isInvalid).toBe(true);

    component.body = signal({ commentValue: '', selectValue: 2024 });
    expect(component.isInvalid).toBe(false);
  });

  it('should setup and clear auto-hide timeouts', () => {
    jest.useFakeTimers();
    const setTimeoutSpy = jest.spyOn(window, 'setTimeout');
    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');

    const mockAlert: GlobalAlert = {
      severity: 'info',
      summary: 'Test',
      detail: 'Test',
      autoHideDuration: 1000
    };

    actionsService.globalAlertsStatus.set([mockAlert]);
    fixture.detectChanges();

    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1000);

    component.ngOnDestroy();
    expect(clearTimeoutSpy).toHaveBeenCalled();

    setTimeoutSpy.mockRestore();
    clearTimeoutSpy.mockRestore();
  });

  it('should close alert and reset body', () => {
    const mockAlert: GlobalAlert = {
      severity: 'info',
      summary: 'Test',
      detail: 'Test'
    };

    actionsService.globalAlertsStatus.set([mockAlert]);
    component.body = signal({ commentValue: 'test', selectValue: 2024 });
    fixture.detectChanges();

    component.closeAlert(0);

    expect(actionsService.hideGlobalAlert).toHaveBeenCalledWith(0);
    expect(component.body().commentValue).toBe('');
    expect(component.body().selectValue).toBeNull();
  });
});
