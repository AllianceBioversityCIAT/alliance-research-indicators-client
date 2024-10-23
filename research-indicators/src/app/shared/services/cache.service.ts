import { Injectable, signal, WritableSignal } from '@angular/core';
import { DataCache } from '../interfaces/cache.interface';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  //user
  isLoggedIn = signal(false);
  isValidatingToken = signal(false);
  dataCache: WritableSignal<DataCache> = signal(localStorage.getItem('data') ? JSON.parse(localStorage.getItem('data') ?? '') : {});
  showMetadataPanel = signal(localStorage.getItem('showMetadataPanel') === 'true');
  currentSectionHeaderName = signal('');

  setCurrentSectionHeaderName(name: string) {
    this.currentSectionHeaderName.set(name);
  }
}
