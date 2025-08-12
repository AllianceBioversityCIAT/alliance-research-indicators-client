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

  deleteStructureByIndex(index: number) {
    this.structures.update(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
  }

  deleteStructureItemByIndex(structureIndex: number, itemIndex: number) {
    this.structures.update(previousStructures => {
      const structuresCopy = [...previousStructures];
      const targetStructure = structuresCopy[structureIndex];

      if (!targetStructure || !targetStructure.items || targetStructure.items.length === 0) {
        return structuresCopy;
      }

      if (itemIndex < 0 || itemIndex >= targetStructure.items.length) {
        return structuresCopy;
      }

      targetStructure.items = [...targetStructure.items.slice(0, itemIndex), ...targetStructure.items.slice(itemIndex + 1)];

      return structuresCopy;
    });
  }

  async getStructures() {
    const res = await this.api.GET_Structures();
    this.structures.set(res.data.structures);
  }
}
