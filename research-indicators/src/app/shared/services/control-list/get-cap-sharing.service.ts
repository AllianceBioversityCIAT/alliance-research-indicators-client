import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { SessionFormat, SessionType } from '../../interfaces/get-cap-sharing.interface';
import { multiControlListResponse } from '../../interfaces/responses.interface';

@Injectable({
  providedIn: 'root'
})
export class GetCapSharingService {
  apiService = inject(ApiService);
  formats = signal<multiControlListResponse<SessionFormat>>(new multiControlListResponse<SessionFormat>());
  types = signal<multiControlListResponse<SessionType>>(new multiControlListResponse<SessionType>());
  degrees = signal<multiControlListResponse<any>>(new multiControlListResponse<any>());
  lengths = signal<multiControlListResponse<any>>(new multiControlListResponse<any>());
  constructor() {
    this.main();
  }

  async main() {
    const response = await this.apiService.GET_SessionFormat();
    this.formats.set({ list: response.data, loading: false });
    const response2 = await this.apiService.GET_SessionType();
    this.types.set({ list: response2.data, loading: false });
    const response3 = await this.apiService.GET_Degrees();
    this.degrees.set({ list: response3.data, loading: false });
    const response4 = await this.apiService.GET_SessionLength();
    this.lengths.set({ list: response4.data, loading: false });
    console.log(this.lengths());
  }
}
