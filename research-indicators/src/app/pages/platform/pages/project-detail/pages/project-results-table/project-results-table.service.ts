import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../../../../../../shared/services/api.service';
import { GetResultsByContract } from '../../../../../../shared/interfaces/get-results-by-contract.interface';

@Injectable({
  providedIn: 'root'
})
export class ProjectResultsTableService {
  loading = signal(true);
  resultList = signal<GetResultsByContract[]>([]);
  api = inject(ApiService);
  contractId = '';

  async getData() {
    this.loading.set(true);
    const response = await this.api.GET_ResultsByContractId(this.contractId);
    response.data.forEach((result: GetResultsByContract) => {
      result.full_name = `${result.result_official_code} - ${result.title} - ${result.indicator.name}`;
      result.indicatorName = result.indicator.name;
      result.statusName = result.result_status.name;
      result.creatorName = `${result.created_user.first_name} ${result.created_user.last_name}`;
    });

    this.resultList.set(response.data);
    this.loading.set(false);
  }
}
