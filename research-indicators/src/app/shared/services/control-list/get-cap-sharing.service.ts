import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { Degree, Gender, Length, SessionFormat, SessionType } from '../../interfaces/get-cap-sharing.interface';
import { multiControlListResponse } from '../../interfaces/responses.interface';

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
  }
}
