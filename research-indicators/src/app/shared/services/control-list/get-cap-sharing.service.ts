import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { Degree, Gender, Length, SessionFormat, SessionType } from '../../interfaces/get-cap-sharing.interface';
import { multiControlListResponse } from '../../interfaces/responses.interface';
import { GetDeliveryModality } from '../../interfaces/get-delivery-modality.interface';
import { SessionPurpose } from '../../interfaces/get-session-purpose.interface';

@Injectable({
  providedIn: 'root'
})
export class GetCapSharingService {
  apiService = inject(ApiService);
  formats = signal<multiControlListResponse<SessionFormat>>(new multiControlListResponse<SessionFormat>());
  types = signal<multiControlListResponse<SessionType>>(new multiControlListResponse<SessionType>());
  degrees = signal<multiControlListResponse<Degree>>(new multiControlListResponse<Degree>());
  lengths = signal<multiControlListResponse<Length>>(new multiControlListResponse<Length>());
  genders = signal<multiControlListResponse<Gender>>(new multiControlListResponse<Gender>());
  deliveryModalities = signal<multiControlListResponse<GetDeliveryModality>>(new multiControlListResponse<GetDeliveryModality>());
  sessionPurpose = signal<multiControlListResponse<SessionPurpose>>(new multiControlListResponse<SessionPurpose>());
  constructor() {
    this.main();
  }

  async main() {
    const response1 = await this.apiService.GET_SessionFormat();
    this.formats.set({ list: response1.data, loading: false });
    const response2 = await this.apiService.GET_SessionType();
    this.types.set({ list: response2.data, loading: false });
    const response3 = await this.apiService.GET_Degrees();
    this.degrees.set({ list: response3.data, loading: false });
    const response4 = await this.apiService.GET_SessionLength();
    this.lengths.set({ list: response4.data, loading: false });
    const response5 = await this.apiService.GET_Gender();
    this.genders.set({ list: response5.data, loading: false });
    const response6 = await this.apiService.GET_DeliveryModalities();
    this.deliveryModalities.set({ list: response6.data, loading: false });
    const response7 = await this.apiService.GET_SessionPurpose();
    this.sessionPurpose.set({ list: response7.data, loading: false });
    console.log(this.sessionPurpose().list);
  }
}
