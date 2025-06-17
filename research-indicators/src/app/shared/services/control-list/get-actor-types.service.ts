import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { ActorType } from '@shared/interfaces/get-actor-types.interface';

@Injectable({
  providedIn: 'root'
})
export class GetActorTypesService {
  private readonly apiService = inject(ApiService);
  loading = signal(true);
  list = signal<ActorType[]>([]);
  isOpenSearch = signal(false);

  constructor() {
    this.main();
  }

  async main() {
    this.loading.set(true);
    const response = await this.apiService.GET_ActorTypes();
    this.list.set(response.data);
    this.loading.set(false);
  }
}
