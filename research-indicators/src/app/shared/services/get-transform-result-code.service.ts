import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class GetTransformResultCodeService {
  api = inject(ApiService);

  async GetTransformResultCode(id: number): Promise<number> {
    const transformResponse = await this.api.GET_TransformResultCode(id);
    const newResultId = transformResponse?.data?.result_id;

    return newResultId;
  }
}
