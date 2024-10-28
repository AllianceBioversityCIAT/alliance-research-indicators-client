import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { ApiService } from '../api.service';
import { Result } from '../../interfaces/result.interface';

@Injectable({
  providedIn: 'root'
})
export class GetResultsService {
  api = inject(ApiService);
  results: WritableSignal<Result[]> = signal([]);
  constructor() {
    this.getData();
  }

  async getData() {
    const results = await this.api.GET_Results();
    this.results.set(results.data);
  }
}
