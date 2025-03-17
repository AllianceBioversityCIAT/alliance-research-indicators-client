import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { GetContractsByUser } from '@shared/interfaces/get-contracts-by-user.interface';

@Injectable({
  providedIn: 'root'
})
export class GetContractsByUserService {
  api = inject(ApiService);
  list = signal<GetContractsByUser[]>([]);
  loading = signal(true);
  isOpenSearch = signal(false);

  constructor() {
    this.main();
  }

  async main() {
    this.loading.set(true);
    const response = await this.api.GET_ContractsByUser();

    if (response?.data) {
      this.list.set(response.data);

      this.list.update(current =>
        current.map(item => ({
          ...item,
          full_name: `${item.agreement_id} ${item.projectDescription} ${item.description} ${item.project_lead_description}`
        }))
      );
    } else {
      this.list.set([]);
    }

    this.loading.set(false);
  }
}
