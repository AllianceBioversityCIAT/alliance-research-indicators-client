import { Injectable } from '@angular/core';
import { BaseResultsService } from './base-results.service';

@Injectable({
  providedIn: 'root'
})
export class OicrResultsService extends BaseResultsService {
  protected getIndicatorCodes(): number[] {
    return [5];
  }
}
