import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { GetInstitution } from '../../interfaces/get-institutions.interface';

@Injectable({
  providedIn: 'root'
})
export class GetInstitutionsService {
  api = inject(ApiService);
  list = signal<GetInstitution[]>([]);
  loading = signal(false);
  constructor() {
    this.main();
  }

  async main() {
    this.loading.set(true);
    const response = await this.api.GET_Institutions();
    response.data.map((institution: GetInstitution) => {
      institution.institution_id = institution.code;
      institution.region_id = institution.code;
      institution.html_full_name = `<strong>${institution.acronym}</strong> - ${institution.name}`;
    });
    console.log(response.data);
    this.list.set(response.data);
    this.loading.set(false);
  }
}
