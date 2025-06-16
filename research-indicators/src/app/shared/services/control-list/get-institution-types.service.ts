import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { InstitutionType } from '@shared/interfaces/get-institutions-types.interface';

@Injectable({
  providedIn: 'root'
})
export class GetInstitutionTypesService {
  private readonly apiService = inject(ApiService);
  loading = signal(true);
  list = signal<InstitutionType[]>([]);
  isOpenSearch = signal(false);

  constructor() {
    this.main();
  }

  async main() {
    this.loading.set(true);
    const response = await this.apiService.GET_InstitutionTypes();
    this.list.set(response.data);
    this.loading.set(false);
  }
}
