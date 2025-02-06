import { inject, Injectable, signal } from '@angular/core';
import { GetResultsService } from '../../../../shared/services/control-list/get-results.service';
import { Result } from '@interfaces/result/result.interface';
import { IndicatorsIds } from '../../../../shared/enums/indicators-enum';
@Injectable({
  providedIn: 'root'
})
export class ResultsCenterService {
  list = signal<Result[]>([]);
  getResultsService = inject(GetResultsService);
  constructor() {
    this.updateList();
  }
  updateList = async (type?: IndicatorsIds) => this.list.set((await this.getResultsService.getInstance(type))());
}
