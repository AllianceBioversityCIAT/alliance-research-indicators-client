import { TestBed } from '@angular/core/testing';
import { DropdownsCacheService } from './dropdowns-cache.service';
import { DropdownName } from '@ts-types/dropdown.types';

describe('DropdownsCacheService', () => {
  let service: DropdownsCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DropdownsCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with all dropdowns set to false', () => {
    const initialDropdowns = service.dropdown();
    expect(initialDropdowns.result).toBe(false);
    expect(initialDropdowns.profile).toBe(false);
    expect(initialDropdowns.notifications).toBe(false);
  });

  it('should show result dropdown', () => {
    service.showDropdown('result');
    const dropdowns = service.dropdown();
    expect(dropdowns.result).toBe(true);
    expect(dropdowns.profile).toBe(false);
    expect(dropdowns.notifications).toBe(false);
  });

  it('should show profile dropdown', () => {
    service.showDropdown('profile');
    const dropdowns = service.dropdown();
    expect(dropdowns.result).toBe(false);
    expect(dropdowns.profile).toBe(true);
    expect(dropdowns.notifications).toBe(false);
  });

  it('should show notifications dropdown', () => {
    service.showDropdown('notifications');
    const dropdowns = service.dropdown();
    expect(dropdowns.result).toBe(false);
    expect(dropdowns.profile).toBe(false);
    expect(dropdowns.notifications).toBe(true);
  });

  it('should update only the specified dropdown and preserve others', () => {
    // Primero mostrar result
    service.showDropdown('result');
    let dropdowns = service.dropdown();
    expect(dropdowns.result).toBe(true);
    expect(dropdowns.profile).toBe(false);
    expect(dropdowns.notifications).toBe(false);

    // Luego mostrar profile sin afectar result
    service.showDropdown('profile');
    dropdowns = service.dropdown();
    expect(dropdowns.result).toBe(true);
    expect(dropdowns.profile).toBe(true);
    expect(dropdowns.notifications).toBe(false);

    // Finalmente mostrar notifications sin afectar los anteriores
    service.showDropdown('notifications');
    dropdowns = service.dropdown();
    expect(dropdowns.result).toBe(true);
    expect(dropdowns.profile).toBe(true);
    expect(dropdowns.notifications).toBe(true);
  });
});
