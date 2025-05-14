import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CacheService } from './cache/cache.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GetMetadataService {
  api = inject(ApiService);
  cache = inject(CacheService);
  router = inject(Router);

  async update(id: number): Promise<boolean> {
    const response = await this.api.GET_Metadata(id);
    if (response?.status === 404) {
      this.router.navigate(['/results-center']);
      return false;
    } else {
      this.cache.currentMetadata.set(response?.data);
      return true;
    }
  }

  formatText(input: string): string {
    const words = input.split(' ');
    if (words.length < 2) return '';
    const firstPart = words[0].slice(0, 3).charAt(0).toUpperCase() + words[0].slice(1, 3).toLowerCase();
    const lastWord = words[words.length - 1];
    const lastPart = lastWord.slice(0, 3).charAt(0).toUpperCase() + lastWord.slice(1, 3).toLowerCase();
    return firstPart + lastPart;
  }

  clearMetadata() {
    this.cache.currentMetadata.set({});
    this.cache.currentResultId.set(0);
  }
}
