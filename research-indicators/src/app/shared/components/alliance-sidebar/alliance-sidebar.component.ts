import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CacheService } from '@services/cache/cache.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { S3ImageUrlPipe } from '@shared/pipes/s3-image-url.pipe';
import { RolesService } from '@services/cache/roles.service';
import { ActionsService } from '@services/actions.service';
import { AccountSidebarOption, AdministrationNavChild, AdministrationNavGroup } from '@interfaces/administration-nav.interface';

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
      children: [
        { label: 'Bulk upload', link: '/administration/center-admin/bulk-upload', s3Image: 'images/brain.png' },
        { label: 'SDG Management', link: '/administration/center-admin/sdg-management', icon: 'pi-bullseye' }
      ]
    }
  ];

  administrationGroupExpanded = signal<Record<string, boolean>>({});

  accountOptions: AccountSidebarOption[] = [
    {
      icon: 'pi-comments',
      label: 'Ask for Help',
      underConstruction: false,
      hide: false,
      action: () => this.allModalsService.openModal('askForHelp')
    },
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

  private effectiveAdministrationGroupExpanded(groupId: string): boolean {
    const v = this.administrationGroupExpanded()[groupId];
    if (v !== undefined) return v;
    return !this.cache.isSidebarCollapsed();
  }

  toggleAdministrationGroup(groupId: string): void {
    const next = !this.effectiveAdministrationGroupExpanded(groupId);
    this.administrationGroupExpanded.update(prev => ({
      ...prev,
      [groupId]: next
    }));
  }

  isAdministrationGroupExpanded(groupId: string): boolean {
    return this.effectiveAdministrationGroupExpanded(groupId);
  }

  visibleAdministrationChildren(group: AdministrationNavGroup): AdministrationNavChild[] {
    return group.children.filter(c => !c.hide);
  }
}
