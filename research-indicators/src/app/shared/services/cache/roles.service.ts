import { Injectable, computed, inject } from '@angular/core';
import { CacheService } from './cache.service';
import { CreateResultManagementService } from '../../components/all-modals/modals-content/create-result-modal/services/create-result-management.service';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  /** Value `1`: super-admin `role_id` and center-admin `focus_id` in this domain. */
  private readonly adminPrimaryNumericId = 1;
  private readonly centerAdminSecRoleIds: readonly number[] = [9];

  createResultManagementService = inject(CreateResultManagementService);
  cache = inject(CacheService);
  isAdmin = computed(() =>
    this.cache.dataCache().user.user_role_list.some(
      role => role.role_id === this.adminPrimaryNumericId || this.centerAdminSecRoleIds.includes(role.role_id)
    )
  );

  canAccessCenterAdmin = computed(() => this.cache.dataCache().user.user_role_list.some(entry => this.userHasCenterAdminRole(entry)));
  canEditOicr = computed(() => {
    if (!this.createResultManagementService.editingOicr()) {
      return true;
    }
    return this.isAdmin();
  });

  private userHasCenterAdminRole(entry: { role_id: number; role?: { focus_id?: number; sec_role_id?: number } | null }): boolean {
    if (entry.role_id === this.adminPrimaryNumericId) {
      return true;
    }
    if (entry.role?.focus_id !== this.adminPrimaryNumericId) {
      return false;
    }
    const secId = entry.role?.sec_role_id;
    return secId != null && this.centerAdminSecRoleIds.includes(secId);
  }
}
