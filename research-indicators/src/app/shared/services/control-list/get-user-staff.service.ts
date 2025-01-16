import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { UserStaff } from '../../interfaces/get-user-staff.interface';

@Injectable({
  providedIn: 'root'
})
export class GetUserStaffService {
  api = inject(ApiService);
  list = signal<UserStaff[]>([]);
  loading = signal(false);
  isOpenSearch = signal(false);
  constructor() {
    this.main();
  }

  async main() {
    this.loading.set(true);
    const response = await this.api.GET_UserStaff();
    response.data.map(item => {
      item.full_name = `${item.first_name} ${item.last_name} - ${item.email}`;
      item.user_id = item.carnet;
    });
    this.list.set(response.data);
    this.loading.set(false);
  }
}
