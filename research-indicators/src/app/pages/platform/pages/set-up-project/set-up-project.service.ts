import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../../../shared/services/api.service';
import { Indicator, IndicatorsStructure } from '../../../../shared/interfaces/get-structures.interface';
import { GetIndicators } from '../../../../shared/interfaces/get-indicators.interface';
import { ActionsService } from '../../../../shared/services/actions.service';

@Injectable({
  providedIn: 'root'
})
export class SetUpProjectService {
  showAssignIndicatorModal = signal<boolean>(false);
  manageIndicatorModal = signal<{ show: boolean; indicator?: GetIndicators; editingMode?: boolean }>({ show: false });
  showAllIndicators = signal<boolean>(false);
  editingElementId = signal<string | null | undefined>(null);
  structures = signal<IndicatorsStructure[]>([]);
  showCreateStructure = signal<boolean>(false);
  loadingStructures = signal<boolean>(false);
  assignIndicatorsModal = signal<{
    show: boolean;
    target: { type: 'structure' | 'item'; structureIndex: number; itemIndex: number };
  }>({ show: false, target: { type: 'item', structureIndex: 0, itemIndex: 0 } });
  indicatorList = signal<GetIndicators[]>([]);

  api = inject(ApiService);
  actions = inject(ActionsService);
  mvpSidebarSections = signal<
    {
      label: string;
      path: string;
      greenCheckKey: string;
    }[]
  >([
    {
      label: 'Contributions to indicators',
      path: 'contributions-to-indicators',
      greenCheckKey: ''
    }
  ]);

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

  deleteStructureItemIndicatorByIndex(structureIndex: number, indicatorIndex: number, itemIndex?: number) {
    this.structures.update(previousStructures => {
      const structuresCopy = [...previousStructures];
      const targetStructure = structuresCopy[structureIndex];

      if (!targetStructure) return structuresCopy;

      if (typeof itemIndex === 'number') {
        if (!targetStructure.items || itemIndex < 0 || itemIndex >= targetStructure.items.length) return structuresCopy;
        const targetItem = targetStructure.items[itemIndex];
        if (!targetItem || !targetItem.indicators || indicatorIndex < 0 || indicatorIndex >= targetItem.indicators.length) return structuresCopy;
        targetItem.indicators = [...targetItem.indicators.slice(0, indicatorIndex), ...targetItem.indicators.slice(indicatorIndex + 1)];
        return structuresCopy;
      }

      const structureIndicators = targetStructure.indicators || [];
      if (indicatorIndex < 0 || indicatorIndex >= structureIndicators.length) return structuresCopy;
      targetStructure.indicators = [...structureIndicators.slice(0, indicatorIndex), ...structureIndicators.slice(indicatorIndex + 1)];
      return structuresCopy;
    });
  }

  async getStructures() {
    this.loadingStructures.set(true);
    try {
      const res = await this.api.GET_Structures();
      this.structures.set(res.data.structures);
    } catch {
      this.actions.showToast({ severity: 'error', summary: 'Error', detail: 'Failed to get structures' });
      this.structures.set([]);
    } finally {
      this.loadingStructures.set(false);
    }
  }

  assignIndicator(indicator: Indicator | GetIndicators) {
    this.structures.update(prev => {
      const { structureIndex, itemIndex } = this.assignIndicatorsModal().target;
      if (structureIndex === undefined) return [...prev];
      if (this.assignIndicatorsModal().target?.type === 'structure') {
        prev[structureIndex].indicators.push(indicator as Indicator);
      } else if (this.assignIndicatorsModal().target?.type === 'item' && prev[structureIndex].items?.length) {
        prev[structureIndex].items[itemIndex].indicators = [...(prev[structureIndex].items[itemIndex].indicators || []), indicator as Indicator];
      }
      return [...prev];
    });
  }
}
