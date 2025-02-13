import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class GetSubnationalByIsoAlphaService {
  api = inject(ApiService);
  results: WritableSignal<any[]> = signal([]);
  loading = signal(false);
  isOpenSearch = signal(false);

  getInstance = async (endpointParams: { isoAlpha2: string }): Promise<WritableSignal<any[]>> => {
    const newSignal = signal<any[]>([]);
    const response = await this.api.GET_SubNationals(endpointParams.isoAlpha2);
    response.data.map((item: any) => {
      item.sub_national_id = item.id;
    });

    newSignal.set(response.data);

    console.log(newSignal());
    return newSignal;
  };
}
