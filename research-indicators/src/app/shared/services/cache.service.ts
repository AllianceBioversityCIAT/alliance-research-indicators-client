import { Injectable, signal, WritableSignal } from '@angular/core';
import { UserInfo } from '../interfaces/cache.interface';
import { User } from '../interfaces/responses.interface';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  //user
  isLoggedIn = signal(false);
  isValidatingToken = signal(false);
  userInfo: WritableSignal<UserInfo> = signal(localStorage.getItem('decoded') ? JSON.parse(localStorage.getItem('decoded') ?? '') : {});
  token = signal(localStorage.getItem('token') ?? '');
  showMetadataPanel = signal(localStorage.getItem('showMetadataPanel') === 'true');
  currentSectionHeaderName = signal('');
  user: WritableSignal<User> = signal(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') ?? '') : {});

  setCurrentSectionHeaderName(name: string) {
    this.currentSectionHeaderName.set(name);
  }
}
