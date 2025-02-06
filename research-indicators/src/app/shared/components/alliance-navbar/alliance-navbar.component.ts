/* eslint-disable @typescript-eslint/no-explicit-any */

import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CacheService } from '@services/cache/cache.service';
import { DarkModeService } from '@services/dark-mode.service';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { AllianceNavOptions } from '@interfaces/nav.interface';
import { DropdownComponent } from '@components/dropdown/dropdown.component';
import { ActionsService } from '@services/actions.service';
import { AllModalsService } from '@services/cache/all-modals.service';
import { DropdownsCacheService } from '../../services/cache/dropdowns-cache.service';
import { ServiceLocatorService } from '@shared/services/service-locator.service';
@Component({
  selector: 'alliance-navbar',
  standalone: true,
  imports: [ButtonModule, BadgeModule, ChipModule, RouterLink, RouterLinkActive, AvatarModule, AvatarGroupModule, DropdownComponent],
  templateUrl: './alliance-navbar.component.html',
  styleUrl: './alliance-navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllianceNavbarComponent implements OnInit {
  dropdownsCache = inject(DropdownsCacheService);
  allModalsService = inject(AllModalsService);
  cache = inject(CacheService);
  darkModeService = inject(DarkModeService);
  router = inject(Router);
  actions = inject(ActionsService);
  serviceLocator = inject(ServiceLocatorService);
  service: any;
  private searchDebounceTimeout: any;

  searchText = signal('');
  options: AllianceNavOptions[] = [
    { label: 'Home', path: '/home', underConstruction: false },
    { label: 'My Dashboard', path: '/settings', underConstruction: true, disabled: true },
    { label: 'My Projects', path: '/my-projects', icon: 'keyboard_arrow_down', underConstruction: false },
    { label: 'Results', path: '/results-center', underConstruction: true, disabled: false }
  ];

  ngOnInit() {
    this.service = this.serviceLocator.getService('openSearchResult');
  }

  onSearchTextChange(event: Event) {
    this.router.navigate(['/search-a-result']);
    this.searchText.set((event.target as HTMLInputElement).value);
    clearTimeout(this.searchDebounceTimeout);
    this.searchDebounceTimeout = setTimeout(async () => {
      await this.service.update(this.searchText(), 100);
    }, 500);
  }
}
