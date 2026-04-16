import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CacheService } from '@services/cache/cache.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { S3ImageUrlPipe } from '@shared/pipes/s3-image-url.pipe';
import { RolesService } from '@services/cache/roles.service';
import { ActionsService } from '@services/actions.service';

export interface AdministrationNavChild {
  label: string;
  link: string;
  icon: string;
  hide?: boolean;
}

export interface AdministrationNavGroup {
  id: string;
  label: string;
  icon: string;
  children: AdministrationNavChild[];
}

@Component({
  selector: 'alliance-sidebar',
  imports: [RouterModule, CommonModule, TooltipModule, S3ImageUrlPipe],
  templateUrl: './alliance-sidebar.component.html',
  styleUrl: './alliance-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllianceSidebarComponent implements OnInit {
  cache = inject(CacheService);
  allModalsService = inject(AllModalsService);
  rolesService = inject(RolesService);
  actions = inject(ActionsService);

  resourceOptions = [
    { icon: 'pi-file', label: 'About Indicators', link: '/about-indicators', disabled: false },
    { icon: 'pi-exclamation-circle transform scale-y-[-1]', label: 'About the Tool', link: '1', underConstruction: true, hide: false },
    { icon: 'pi-external-link', label: 'Other Reporting Tools', link: '45', underConstruction: true, hide: false }
  ];

  administrationGroups: AdministrationNavGroup[] = [
    {
      id: 'center-admin',
      label: 'Center admin',
      icon: 'pi-id-card',
      children: [{ label: 'Bulk upload', link: '/administration/center-admin/bulk-upload', icon: 'pi-upload' }]
    }
  ];

  administrationGroupExpanded = signal<Record<string, boolean>>({
    'center-admin': true
  });

  accountOptions = [
    {
      icon: 'pi-comments',
      label: 'Ask for Help',
      underConstruction: false,
      hide: false,
      action: () => this.allModalsService.openModal('askForHelp')
    },
    { icon: 'pi-cog', label: 'Settings', link: '/profile', hide: false },
    {
      icon: 'pi-sign-out',
      label: 'Log out',
      hide: false,
      action: () => void this.actions.logOut(),
      logout: true
    }
  ];

  innerWidth = 0;

  ngOnInit() {
    this.innerWidth = globalThis.innerWidth;

    if ((this.innerWidth <= 1200 || this.cache.hasSmallScreen()) && !this.cache.isSidebarCollapsed()) {
      this.cache.toggleSidebar();
    }
  }

  toggleSidebarAndResize(): void {
    this.cache.toggleSidebar();

    setTimeout(() => {
      globalThis.dispatchEvent(new Event('resize'));
    }, 150);
  }

  toggleAdministrationGroup(groupId: string): void {
    this.administrationGroupExpanded.update(prev => ({
      ...prev,
      [groupId]: !(prev[groupId] ?? true)
    }));
  }

  isAdministrationGroupExpanded(groupId: string): boolean {
    return this.administrationGroupExpanded()[groupId] !== false;
  }

  visibleAdministrationChildren(group: AdministrationNavGroup): AdministrationNavChild[] {
    return group.children.filter(c => !c.hide);
  }
}
