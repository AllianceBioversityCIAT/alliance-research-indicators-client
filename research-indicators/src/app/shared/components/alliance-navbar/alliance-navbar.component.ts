import { ChangeDetectionStrategy, Component, inject, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DynamicToastService } from '../../services/dynamic-toast.service';
import { CacheService } from '../../services/cache.service';
import { DarkModeService } from '../../services/dark-mode.service';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { AllianceNavOptions } from '../../interfaces/nav.interface';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { ActionsService } from '../../services/actions.service';
import { CreateResultModalComponent } from '../create-result-modal/create-result-modal.component';
@Component({
  selector: 'alliance-navbar',
  standalone: true,
  imports: [ButtonModule, BadgeModule, ChipModule, RouterLink, RouterLinkActive, AvatarModule, AvatarGroupModule, DropdownComponent, CreateResultModalComponent],
  templateUrl: './alliance-navbar.component.html',
  styleUrl: './alliance-navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllianceNavbarComponent {
  dynamicToast = inject(DynamicToastService);
  cache = inject(CacheService);
  darkModeService = inject(DarkModeService);
  router = inject(Router);
  actions = inject(ActionsService);
  options: AllianceNavOptions[] = [
    { label: 'Home', path: '/home' },
    { label: 'My Results', path: '/settings', icon: 'keyboard_arrow_down' },
    { label: 'My Contracts', path: '/profile', icon: 'keyboard_arrow_down' }
  ];

  @ViewChild('modal') modal!: CreateResultModalComponent; // Referencia al modal

  openModal() {
    this.modal.showDialog();
  }
}
