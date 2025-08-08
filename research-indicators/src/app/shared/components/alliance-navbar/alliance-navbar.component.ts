/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  NgZone,
  Renderer2
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CacheService } from '@services/cache/cache.service';
import { DarkModeService } from '@services/dark-mode.service';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { AllianceNavOptions } from '@interfaces/nav.interface';
import { ActionsService } from '@services/actions.service';
import { AllModalsService } from '@services/cache/all-modals.service';
import { DropdownsCacheService } from '../../services/cache/dropdowns-cache.service';
import { ServiceLocatorService } from '@shared/services/service-locator.service';

@Component({
  selector: 'alliance-navbar',
  imports: [ButtonModule, BadgeModule, ChipModule, RouterLink, RouterLinkActive, AvatarModule, AvatarGroupModule],
  templateUrl: './alliance-navbar.component.html',
  styleUrl: './alliance-navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllianceNavbarComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('navbar') navbarElement!: ElementRef;
  @ViewChild('dropdownRef') dropdownRef!: ElementRef;

  private resizeObserver: ResizeObserver | null = null;
  private readonly zone = inject(NgZone);
  dropdownsCache = inject(DropdownsCacheService);
  allModalsService = inject(AllModalsService);
  cache = inject(CacheService);
  darkModeService = inject(DarkModeService);
  router = inject(Router);
  actions = inject(ActionsService);
  serviceLocator = inject(ServiceLocatorService);
  elementRef = inject(ElementRef);
  service: any;
  private searchDebounceTimeout: any;
  showDropdown = false;

  options: AllianceNavOptions[] = [
    { label: 'Home', path: '/home', underConstruction: false },
    { label: 'My Dashboard', path: '/settings', underConstruction: true, disabled: true },
    { label: 'Projects', path: '/projects', underConstruction: false },
    { label: 'Results Center', path: '/results-center', underConstruction: false, disabled: false }
  ];

  constructor(private readonly renderer: Renderer2) {}

  ngOnInit() {
    this.service = this.serviceLocator.getService('openSearchResult');
  }

  ngAfterViewInit(): void {
    const navbar = this.elementRef.nativeElement.querySelector('#navbar');
    if (navbar) {
      this.resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          this.cache.navbarHeight.set(entry.contentRect.height);
        }
      });

      this.resizeObserver.observe(navbar);
    }

    this.renderer.listen('document', 'click', (event: Event) => {
      if (this.showDropdown && this.dropdownRef && !this.dropdownRef.nativeElement.contains(event.target)) {
        this.showDropdown = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  onSearchTextChange(event: Event) {
    this.router.navigate(['/search-a-result']);
    this.cache.searchAResultValue.set((event.target as HTMLInputElement).value);
    clearTimeout(this.searchDebounceTimeout);
    this.searchDebounceTimeout = setTimeout(async () => {
      await this.service.update(this.cache.searchAResultValue(), 100);
    }, 500);
  }
}
