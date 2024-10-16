import { Injectable } from '@angular/core';
import { IBDGoogleAnalytics } from 'ibdevkit';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {
  constructor() {
    IBDGoogleAnalytics().initialize(environment.googleAnalyticsId);
  }
}
