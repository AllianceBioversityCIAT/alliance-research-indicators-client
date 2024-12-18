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

  formatText(input: string): string {
    const words = input.split(' ');
    if (words.length < 2) return '';
    const firstPart = words[0].slice(0, 3).charAt(0).toUpperCase() + words[0].slice(1, 3).toLowerCase();
    const lastWord = words[words.length - 1];
    const lastPart = lastWord.slice(0, 3).charAt(0).toUpperCase() + lastWord.slice(1, 3).toLowerCase();
    return firstPart + lastPart;
  }
}
