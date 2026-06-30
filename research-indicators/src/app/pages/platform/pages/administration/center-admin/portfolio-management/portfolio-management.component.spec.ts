import { Component, Input, WritableSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import PortfolioManagementComponent from './portfolio-management.component';
import { Portfolio } from '@shared/interfaces/portfolio.interface';
import { ApiService } from '@shared/services/api.service';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { ActionsService } from '@shared/services/actions.service';
import { RolesService } from '@shared/services/cache/roles.service';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { InputComponent } from '@shared/components/custom-fields/input/input.component';
import { TextareaComponent } from '@shared/components/custom-fields/textarea/textarea.component';
import { CalendarInputComponent } from '@shared/components/custom-fields/calendar-input/calendar-input.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: '<ng-content></ng-content>'
})
class ModalStubComponent {
  @Input() modalName = '';
  @Input() clearModal: () => void = () => undefined;
}

@Component({
  selector: 'app-input',
  standalone: true,
  template: ''
})
class InputStubComponent {
  @Input() signal!: WritableSignal<Record<string, unknown>>;
  @Input() optionValue = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() isRequired = false;
}

@Component({
  selector: 'app-textarea',
  standalone: true,
  template: ''
})
class TextareaStubComponent {
  @Input() signal!: WritableSignal<Record<string, unknown>>;
  @Input() optionValue = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() isRequired = false;
  @Input() rows = 10;
  @Input() styleClass = '';
  @Input() maxLength = 40000;
}

@Component({
  selector: 'app-calendar-input',
  standalone: true,
  template: ''
})
class CalendarInputStubComponent {
  @Input() signal!: WritableSignal<Record<string, unknown>>;
  @Input() optionValue = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() isRequired = false;
  @Input() minDate: unknown = null;
  @Input() maxDate: unknown = null;
  @Input() disabled = false;
}

describe('PortfolioManagementComponent', () => {
  let fixture: ComponentFixture<PortfolioManagementComponent>;
  let component: PortfolioManagementComponent;
  let modalConfig: ReturnType<typeof signal<Record<string, any>>>;
  let modals: {
    modalConfig: typeof modalConfig;
    openModal: jest.Mock;
    closeModal: jest.Mock;
  };
  let actions: {
    showToast: jest.Mock;
    showGlobalAlert: jest.Mock;
  };
  let roles: {
    isSystemAdmin: jest.Mock;
  };
  const api = {
    GET_Portfolios: jest.fn(),
    POST_Portfolio: jest.fn(),
    PATCH_Portfolio: jest.fn(),
    DELETE_Portfolio: jest.fn()
  };

  const portfolio: Portfolio = {
    id: 1,
    name: 'Alliance 2026-2030',
    description: 'New strategy portfolio',
    start_year: 2026,
    end_year: 2030
  };

  async function setup(portfolios: Portfolio[] = [portfolio]): Promise<void> {
    modalConfig = signal<Record<string, any>>({
      portfolioManagement: { isOpen: false, title: 'Portfolio management' }
    });
    modals = {
      modalConfig,
      openModal: jest.fn((name: string) => {
        modalConfig.update(current => ({ ...current, [name]: { ...current[name], isOpen: true } }));
      }),
      closeModal: jest.fn((name: string) => {
        modalConfig.update(current => ({ ...current, [name]: { ...current[name], isOpen: false } }));
      })
    };
    actions = {
      showToast: jest.fn(),
      showGlobalAlert: jest.fn()
    };
    roles = {
      isSystemAdmin: jest.fn().mockReturnValue(true)
    };
    api.GET_Portfolios.mockResolvedValue({ data: portfolios });
    api.POST_Portfolio.mockResolvedValue({ data: portfolio });
    api.PATCH_Portfolio.mockResolvedValue({ data: portfolio });
    api.DELETE_Portfolio.mockResolvedValue({ data: {} });

    await TestBed.configureTestingModule({
      imports: [PortfolioManagementComponent],
      providers: [
        { provide: ApiService, useValue: api as unknown as ApiService },
        { provide: AllModalsService, useValue: modals as unknown as AllModalsService },
        { provide: ActionsService, useValue: actions as unknown as ActionsService },
        { provide: RolesService, useValue: roles as unknown as RolesService }
      ]
    })
      .overrideComponent(PortfolioManagementComponent, {
        remove: { imports: [ModalComponent, InputComponent, TextareaComponent, CalendarInputComponent] },
        add: { imports: [ModalStubComponent, InputStubComponent, TextareaStubComponent, CalendarInputStubComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(PortfolioManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
    jest.clearAllMocks();
  });

  it('loads and renders portfolios sorted by start date', async () => {
    await setup([
      { ...portfolio, id: 2, name: 'Later', start_year: 2031, end_year: 2035 },
      portfolio
    ]);

    expect(component.loading()).toBe(false);
    expect(component.loadError()).toBe(false);
    expect(component.portfolios()[0].name).toBe('Alliance 2026-2030');
    expect(fixture.nativeElement.textContent).toContain('Alliance 2026-2030');
    expect(fixture.nativeElement.querySelector('[aria-label="Edit portfolio"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[aria-label="Delete portfolio"]')).toBeNull();
    expect(component.tableStyle()).toEqual(expect.objectContaining({ width: '100%', 'table-layout': 'fixed' }));
  });

  it('shows empty state when there are no portfolios', async () => {
    await setup([]);

    expect(component.portfolios()).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('No portfolios found');
  });

  it('sets load error when portfolios cannot be loaded', async () => {
    modalConfig = signal<Record<string, any>>({
      portfolioManagement: { isOpen: false, title: 'Portfolio management' }
    });
    modals = {
      modalConfig,
      openModal: jest.fn(),
      closeModal: jest.fn()
    };
    actions = {
      showToast: jest.fn(),
      showGlobalAlert: jest.fn()
    };
    roles = {
      isSystemAdmin: jest.fn().mockReturnValue(true)
    };
    api.GET_Portfolios.mockImplementationOnce(() => {
      throw new Error('fail');
    });

    await TestBed.configureTestingModule({
      imports: [PortfolioManagementComponent],
      providers: [
        { provide: ApiService, useValue: api as unknown as ApiService },
        { provide: AllModalsService, useValue: modals as unknown as AllModalsService },
        { provide: ActionsService, useValue: actions as unknown as ActionsService },
        { provide: RolesService, useValue: roles as unknown as RolesService }
      ]
    })
      .overrideComponent(PortfolioManagementComponent, {
        remove: { imports: [ModalComponent, InputComponent, TextareaComponent, CalendarInputComponent] },
        add: { imports: [ModalStubComponent, InputStubComponent, TextareaStubComponent, CalendarInputStubComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(PortfolioManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.loadError()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('We could not load portfolios.');
  });

  it('creates a portfolio and resets the form', async () => {
    await setup([]);

    component.startCreate();
    component.form.set({
      name: 'Alliance 2026-2030',
      description: 'New strategy portfolio',
      start_year: new Date(2026, 0, 1),
      end_year: new Date(2030, 0, 1)
    });

    await component.save();

    expect(api.POST_Portfolio).toHaveBeenCalledWith({
      name: 'Alliance 2026-2030',
      description: 'New strategy portfolio',
      start_year: 2026,
      end_year: 2030
    });
    expect(component.form().name).toBe('');
    expect(actions.showToast).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Portfolio management',
      detail: 'Portfolio created successfully'
    });
    expect(modals.openModal).toHaveBeenCalledWith('portfolioManagement');
    expect(modals.closeModal).toHaveBeenCalledWith('portfolioManagement');
  });

  it('edits a portfolio and calls PATCH', async () => {
    await setup();

    component.startEdit(portfolio);
    expect(component.isEditing()).toBe(true);
    expect(component.canEditPortfolioDates()).toBe(true);
    expect(component.form().start_year).toEqual(new Date(2026, 0, 1));
    expect(modalConfig().portfolioManagement.title).toBe('Edit portfolio');
    expect(modalConfig().portfolioManagement.confirmText).toBe('Update portfolio');
    component.form.update(current => ({ ...current, name: 'Updated portfolio' }));

    await component.save();

    expect(api.PATCH_Portfolio).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        name: 'Updated portfolio',
        description: 'New strategy portfolio'
      })
    );
    expect(actions.showToast).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Portfolio management',
      detail: 'Portfolio updated successfully'
    });
  });

  it('disables portfolio dates when editing without system admin role', async () => {
    await setup();
    roles.isSystemAdmin.mockReturnValue(false);

    component.startEdit(portfolio);
    component.form.update(current => ({
      ...current,
      start_year: new Date(2020, 0, 1),
      end_year: new Date(2040, 0, 1)
    }));

    expect(component.canEditPortfolioDates()).toBe(false);

    await component.save();

    expect(api.PATCH_Portfolio).toHaveBeenCalledWith(1, {
      name: 'Alliance 2026-2030',
      description: 'New strategy portfolio',
      start_year: 2026,
      end_year: 2030
    });
  });

  it('allows portfolio dates when creating without system admin role', async () => {
    await setup([]);
    roles.isSystemAdmin.mockReturnValue(false);

    expect(component.canEditPortfolioDates()).toBe(true);
  });

  it('does not save when form is invalid or already saving', async () => {
    await setup();

    await component.save();
    expect(api.POST_Portfolio).not.toHaveBeenCalled();

    component.form.set({
      name: 'Portfolio',
      description: 'Description',
      start_year: 2026,
      end_year: 2030
    });
    component.saving.set(true);

    await component.save();
    expect(api.POST_Portfolio).not.toHaveBeenCalled();
  });

  it('shows error when save fails', async () => {
    await setup();
    api.POST_Portfolio.mockRejectedValue(new Error('fail'));
    component.form.set({
      name: 'Portfolio',
      description: 'Description',
      start_year: 2026,
      end_year: 2030
    });

    await component.save();

    expect(actions.showToast).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'We could not save the portfolio. Please try again.'
    });
    expect(component.saving()).toBe(false);
  });

  it('shows confirmation before deleting a portfolio and clears editing state when confirmed', async () => {
    await setup();
    component.startEdit(portfolio);

    component.delete(portfolio);

    expect(api.DELETE_Portfolio).not.toHaveBeenCalled();
    expect(actions.showGlobalAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'warning',
        summary: 'Delete portfolio',
        detail: expect.stringContaining('Are you sure you want to delete Alliance 2026-2030?'),
        confirmCallback: expect.objectContaining({ label: 'Continue' }),
        cancelCallback: expect.objectContaining({ label: 'Cancel' })
      })
    );
    const alertConfig = actions.showGlobalAlert.mock.calls[0][0];
    alertConfig.confirmCallback.event();
    await fixture.whenStable();

    expect(api.DELETE_Portfolio).toHaveBeenCalledWith(1);
    expect(component.isEditing()).toBe(false);
    expect(actions.showToast).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Portfolio management',
      detail: 'Portfolio deleted successfully'
    });
  });

  it('does not delete without id or while another delete is running', async () => {
    await setup();

    component.delete({ ...portfolio, id: undefined, portfolio_id: undefined });
    expect(api.DELETE_Portfolio).not.toHaveBeenCalled();

    component.deletingId.set(2);
    component.delete(portfolio);
    expect(api.DELETE_Portfolio).not.toHaveBeenCalled();
  });

  it('shows error when delete fails', async () => {
    await setup();
    api.DELETE_Portfolio.mockRejectedValue(new Error('fail'));

    component.delete(portfolio);
    const alertConfig = actions.showGlobalAlert.mock.calls[0][0];
    alertConfig.confirmCallback.event();
    await fixture.whenStable();

    expect(actions.showToast).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'We could not delete the portfolio. Please try again.'
    });
    expect(component.deletingId()).toBeNull();
  });

  it('supports portfolio_id as the identifier and cancel create mode', async () => {
    await setup([{ ...portfolio, id: undefined, portfolio_id: 7 }]);

    expect(component.portfolioId(component.portfolios()[0])).toBe(7);
    component.startEdit(component.portfolios()[0]);
    expect(component.editingPortfolioId()).toBe(7);
    component.clearModal();
    expect(component.isEditing()).toBe(false);
  });

  it('filters portfolios by table search and clears the search', async () => {
    await setup([{ ...portfolio, name: 'P2 portfolio' }, { ...portfolio, id: 2, name: 'Legacy portfolio', description: 'P1' }]);

    component.setTableSearch('legacy');
    expect(component.hasTableSearch()).toBe(true);
    expect(component.filteredPortfolios()).toHaveLength(1);
    expect(component.filteredPortfolios()[0].name).toBe('Legacy portfolio');

    component.clearTableSearch();
    expect(component.hasTableSearch()).toBe(false);
    expect(component.filteredPortfolios()).toHaveLength(2);
  });

  it('configures modal confirm action and disabled state', async () => {
    await setup([]);

    component.startCreate();
    expect(modalConfig().portfolioManagement.title).toBe('Create portfolio');
    expect(modalConfig().portfolioManagement.disabledConfirmAction()).toBe(true);
    component.form.set({
      name: 'Portfolio',
      description: 'Description',
      start_year: '2026',
      end_year: '2030'
    });
    expect(modalConfig().portfolioManagement.disabledConfirmAction()).toBe(false);

    modalConfig().portfolioManagement.confirmAction();
    await fixture.whenStable();
    expect(api.POST_Portfolio).toHaveBeenCalled();
  });
});
