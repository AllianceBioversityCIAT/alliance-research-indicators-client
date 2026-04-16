import { Injectable, computed, inject } from '@angular/core';
import { CacheService } from './cache.service';
import { CreateResultManagementService } from '../../components/all-modals/modals-content/create-result-modal/services/create-result-management.service';

export const CAPACITY_BULK_UPLOAD_ROLE_IDS: readonly number[] = [1, 9];

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  createResultManagementService = inject(CreateResultManagementService);
  cache = inject(CacheService);
  isAdmin = computed(() => this.cache.dataCache().user.user_role_list.some(role => role.role_id === 9 || role.role_id === 1));

  canAccessCapacityBulkUpload = computed(() =>
    this.cache.dataCache().user.user_role_list.some(role => CAPACITY_BULK_UPLOAD_ROLE_IDS.includes(role.role_id))
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
}
