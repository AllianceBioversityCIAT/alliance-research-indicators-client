import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../../../shared/services/api.service';
import { Indicator, IndicatorsStructure } from '../../../../shared/interfaces/get-structures.interface';
import { GetIndicators } from '../../../../shared/interfaces/get-indicators.interface';

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
  assignIndicatorsModal = signal<{
    show: boolean;
    target: { type: 'structure' | 'item'; structureIndex: number; itemIndex: number };
  }>({ show: false, target: { type: 'item', structureIndex: 0, itemIndex: 0 } });
  indicatorList = signal<GetIndicators[]>([]);

  api = inject(ApiService);

  constructor() {
    this.getStructures();
    this.getIndicators();
  }
  async getIndicators() {
    const res = await this.api.GET_Indicators();
    this.indicatorList.set(res.data);
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

  assignIndicator(indicator: Indicator | GetIndicators) {
    console.log(indicator);
    console.log(this.structures());
    this.structures.update(prev => {
      const { structureIndex, itemIndex } = this.assignIndicatorsModal().target;
      if (structureIndex === undefined) return [...prev];
      if (this.assignIndicatorsModal().target?.type === 'structure') {
        prev[structureIndex].indicators.push(indicator as Indicator);
      } else if (this.assignIndicatorsModal().target?.type === 'item' && prev[structureIndex].items?.length) {
        console.log(prev[structureIndex]);
        console.log(prev[structureIndex].items);
        console.log(prev[structureIndex].items[itemIndex]);
        console.log(prev[structureIndex].items[itemIndex].indicators);
        console.log(structureIndex);
        console.log(itemIndex);
        prev[structureIndex].items[itemIndex].indicators = [...(prev[structureIndex].items[itemIndex].indicators || []), indicator as Indicator];
      }
      return [...prev];
    });
  }
}
