import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { ClarisaInstitutionsSubTypes } from '@shared/interfaces/get-clarisa-institutions-subtypes.interface';

@Injectable({
  providedIn: 'root'
})
export class GetClarisaInstitutionsSubTypesService {
  api = inject(ApiService);
  list = signal<ClarisaInstitutionsSubTypes[]>([]);
  loading = signal(false);
  isOpenSearch = signal(false);

  async getSubTypes(depthLevel: number, code?: number) {
    this.loading.set(true);
    try {
      const response = await this.api.GET_SubInstitutionTypes(depthLevel, code);
      this.list.set(response.data);
    } catch (error) {
      console.error('Error fetching institution subtypes:', error);
      this.list.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  clearList() {
    this.list.set([]);
  }
}
