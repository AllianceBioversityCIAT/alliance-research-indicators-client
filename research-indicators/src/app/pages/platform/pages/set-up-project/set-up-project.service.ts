import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../../../shared/services/api.service';
import { IndicatorsStructure } from '../../../../shared/interfaces/get-structures.interface';

@Injectable({
  providedIn: 'root'
})
export class SetUpProjectService {
  showAssignIndicatorModal = signal<boolean>(false);
  showIndicatorModal = signal<boolean>(false);
  showAllIndicators = signal<boolean>(false);
  editingElementId = signal<string | null | undefined>(null);
  structures = signal<IndicatorsStructure[]>([]);
  showCreateStructure = signal<boolean>(false);

  api = inject(ApiService);

  constructor() {
    this.getStructures();
  }

  async getStructures() {
    const res = await this.api.GET_Structures();
    console.log(res.data.structures);
    this.structures.set(res.data.structures);
  }
}
