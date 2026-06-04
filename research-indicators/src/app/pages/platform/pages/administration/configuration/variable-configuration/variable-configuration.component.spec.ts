import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import VariableConfigurationComponent from './variable-configuration.component';
import { VariableConfigurationService } from '@shared/services/variable-configuration.service';
import { RolesService } from '@shared/services/cache/roles.service';
import { AllModalsService } from '@shared/services/cache/all-modals.service';

describe('VariableConfigurationComponent', () => {
  let fixture: ComponentFixture<VariableConfigurationComponent>;
  let reload: jest.Mock;

  beforeEach(async () => {
    reload = jest.fn().mockResolvedValue(undefined);
    const mockService = {
      reload,
      loading: signal(false),
      loadError: signal(false),
      items: signal([]),
      facets: signal({ categories: [], subcategories: [] }),
      search: signal(''),
      categoryFilter: signal<string | null>(null),
      subcategoryFilter: signal<string | null>(null),
      draftSearch: signal(''),
      draftCategoryFilter: signal<string | null>(null),
      draftSubcategoryFilter: signal<string | null>(null),
      showAdvancedFilters: signal(false),
      sortField: signal('key' as const),
      sortOrder: signal('ASC' as const),
      saving: signal(false),
      saveError: signal<string | null>(null),
      saveSuccess: signal(false),
      loadList: jest.fn().mockResolvedValue(undefined),
      applyFilters: jest.fn().mockResolvedValue(undefined),
      resetFilters: jest.fn(),
      patchItem: jest.fn(),
      syncJsonDrafts: jest.fn(),
      buildRowSearchHaystack: jest.fn().mockReturnValue(''),
      isJsonConfig: jest.fn().mockReturnValue(false),
      jsonSectionsLabel: jest.fn().mockReturnValue(''),
      openEdit: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [VariableConfigurationComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: VariableConfigurationService, useValue: mockService },
        {
          provide: RolesService,
          useValue: {
            canEditAppConfiguration: () => true,
            canAccessAppConfiguration: () => true
          }
        },
        {
          provide: AllModalsService,
          useValue: {
            openModal: jest.fn(),
            closeModal: jest.fn(),
            isModalOpen: jest.fn().mockReturnValue({ isOpen: false })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VariableConfigurationComponent);
    fixture.detectChanges();
  });

  it('loads configurations on init', () => {
    expect(reload).toHaveBeenCalled();
  });
});
