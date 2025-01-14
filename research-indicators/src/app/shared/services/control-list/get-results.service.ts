import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { Result } from '@interfaces/result/result.interface';

@Injectable({
  providedIn: 'root'
})
export class GetResultsService {
  api = inject(ApiService);
  results: WritableSignal<Result[]> = signal([]);
  isOpenSearch = signal(false);
  constructor() {
    this.updateList();
  }
  updateList = async () => this.results.set((await this.api.GET_Results()).data);
}
