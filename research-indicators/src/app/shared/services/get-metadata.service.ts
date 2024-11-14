import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CacheService } from './cache/cache.service';

@Injectable({
  providedIn: 'root'
})
export class GetMetadataService {
  api = inject(ApiService);
  cache = inject(CacheService);

  async GET_Metadata(id: number) {
    const response = await this.api.GET_Metadata(id);
    this.cache.currentMetadata.set(response?.data);
  }
}
