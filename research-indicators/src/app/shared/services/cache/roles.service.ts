import { Injectable, computed, inject } from '@angular/core';
import { CacheService } from './cache.service';
import { CreateResultManagementService } from '../../components/all-modals/modals-content/create-result-modal/services/create-result-management.service';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private readonly centerAdminFocusId = 1;
  private readonly centerAdminSecRoleIds: readonly number[] = [9, 10];
  private readonly superAdminRoleId = 1;

  createResultManagementService = inject(CreateResultManagementService);
  cache = inject(CacheService);
  isAdmin = computed(() => this.cache.dataCache().user.user_role_list.some(role => role.role_id === 9 || role.role_id === 1));

  canAccessCenterAdmin = computed(() =>
    this.cache.dataCache().user.user_role_list.some(entry => this.userHasCenterAdminRole(entry))
  );
  canEditOicr = computed(() => {
    if (!this.createResultManagementService.editingOicr()) {
      return true;
    }

    const statusId = this.createResultManagementService.statusId();
    const isIntermediateStatus = statusId === 10 || statusId === 12 || statusId === 13 || statusId === 14;

    if (isIntermediateStatus) {
      return this.isAdmin();
    }

    return this.isAdmin();
  });

  private userHasCenterAdminRole(entry: {
    role_id: number;
    role?: { focus_id?: number; sec_role_id?: number } | null;
  }): boolean {
    if (entry.role_id === this.superAdminRoleId) {
      return true;
    }
    if (entry.role?.focus_id !== this.centerAdminFocusId) {
      return false;
    }
    const secId = entry.role?.sec_role_id;
    return secId != null && this.centerAdminSecRoleIds.includes(secId);
  }
}
