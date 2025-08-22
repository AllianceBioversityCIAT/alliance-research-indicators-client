import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../../../shared/services/api.service';
import { Indicator, IndicatorItem, IndicatorsStructure } from '../../../../shared/interfaces/get-structures.interface';
import { GetIndicators } from '../../../../shared/interfaces/get-indicators.interface';
import { ActionsService } from '../../../../shared/services/actions.service';
import { NumberFormatOption, NumberTypeOption } from '../../../../shared/interfaces/project-setup.interface';
import { PostIndicator } from '../../../../shared/interfaces/post-indicator.interface';

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
  currentAgreementId = signal<number | string | null>(null);
  assignIndicatorsModal = signal<{
    show: boolean;
    targetLevel1?: IndicatorsStructure;
    targetLevel2?: IndicatorItem;
  }>({ show: false });
  indicatorList = signal<GetIndicators[]>([]);
  routeid = signal<string | null>(null);

  // Tree hierarchy signals
  level1Name = signal<string>('Structure');
  level2Name = signal<string>('Item');
  editingLevel1 = signal<boolean>(false);
  editingLevel2 = signal<boolean>(false);

  strcutureGrouped = computed(() => {
    const structuresCopy = JSON.parse(JSON.stringify(this.structures()));
    const result = structuresCopy.flatMap((item: any) => {
      const { items, ...itemWithoutItems } = item;
      const isGhostItem = !item.items?.length;
      if (isGhostItem) item.items = [{ id: '', name: '', code: '', indicators: [], editing: true, ghostItem: true }];
      item.items?.map((stItem: any) => {
        stItem.representative = { ...itemWithoutItems, itemsCount: items?.filter((i: any) => !i.ghostItem).length || 0 };
      });
      return item.items || [];
    });

    return result;
  });

  manageIndicatorform = signal<PostIndicator>({
    name: '',
    description: '',
    numberType: '' as unknown as NumberTypeOption,
    numberFormat: '' as unknown as NumberFormatOption,
    years: [],
    targetUnit: '',
    targetValue: 0,
    baseline: 0,
    agreement_id: this.currentAgreementId() as number,
    code: ''
  });

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
    const res = await this.api.GET_Indicators(this.currentAgreementId() as number);
    this.indicatorList.set(res.data);
  }

  deleteStructureByIndex(index: number) {
    this.structures.update(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
  }

  async saveStructures() {
    console.log(this.structures());
    console.log(this.strcutureGrouped());
    console.log(this.strcutureGrouped());
    this.loadingStructures.set(true);
    try {
      await this.api.POST_SyncStructures({ structures: this.structures(), agreement_id: this.routeid() });
      await this.getStructures();
      this.actions.showToast({ severity: 'success', summary: 'Success', detail: 'Structures saved successfully' });
    } catch {
      this.actions.showToast({ severity: 'error', summary: 'Error', detail: 'Failed to save structures' });
    } finally {
      this.loadingStructures.set(false);
    }
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
      const res = await this.api.GET_Structures(this.currentAgreementId() as number);
      this.structures.set(res.data.structures);
      console.log(this.structures());
    } catch {
      this.actions.showToast({ severity: 'error', summary: 'Error', detail: 'Failed to get structures' });
      this.structures.set([]);
    } finally {
      this.loadingStructures.set(false);
    }
  }

  assignIndicator(indicator: Indicator | GetIndicators) {
    // this.structures.update(prev => {
    //   const { structureIndex, itemIndex } = this.assignIndicatorsModal().target;
    //   if (structureIndex === undefined) return [...prev];
    //   if (this.assignIndicatorsModal().target?.type === 'structure') {
    //     prev[structureIndex].indicators.push(indicator as Indicator);
    //   } else if (this.assignIndicatorsModal().target?.type === 'item' && prev[structureIndex].items?.length) {
    //     prev[structureIndex].items[itemIndex].indicators = [...(prev[structureIndex].items[itemIndex].indicators || []), indicator as Indicator];
    //   }
    //   return [...prev];
    // });
    if (this.assignIndicatorsModal().targetLevel1) {
      this.structures.update(prev => {
        const targetStructure = prev.find(structure => structure.id === this.assignIndicatorsModal().targetLevel1?.id);
        if (targetStructure) {
          if (indicator.adding) {
            targetStructure.indicators.push(indicator as Indicator);
            this.assignIndicatorsModal.update(prev => {
              const targetLevel1 = prev.targetLevel1;
              if (targetLevel1) {
                targetLevel1.indicators.push(indicator as Indicator);
                return { ...prev, targetLevel1 };
              }
              return prev;
            });
          } else {
            targetStructure.indicators = targetStructure.indicators.filter(i => i.id != indicator.id);
            this.assignIndicatorsModal.update(prev => {
              const targetLevel1 = prev.targetLevel1;
              if (targetLevel1) {
                targetLevel1.indicators = targetLevel1.indicators.filter(i => i.id != indicator.id);
                return { ...prev, targetLevel1 };
              }
              return prev;
            });
          }
        }
        return [...prev];
      });
      console.log(this.structures());
    }
  }

  // Tree hierarchy editing methods
  startEditingLevel1() {
    this.editingLevel1.set(true);
  }

  startEditingLevel2() {
    this.editingLevel2.set(true);
  }

  saveLevel1Name(newName: string) {
    this.level1Name.set(newName);
    this.editingLevel1.set(false);
    this.saveToLocalStorage();
  }

  saveLevel2Name(newName: string) {
    this.level2Name.set(newName);
    this.editingLevel2.set(false);
    this.saveToLocalStorage();
  }

  cancelEditingLevel1() {
    this.editingLevel1.set(false);
  }

  cancelEditingLevel2() {
    this.editingLevel2.set(false);
  }

  // LocalStorage methods with routeid validation
  private getStorageKey(): string {
    const routeId = this.currentAgreementId();
    return `project-hierarchy-names-${routeId}`;
  }

  private saveToLocalStorage() {
    try {
      const storageKey = this.getStorageKey();
      const data = {
        level1Name: this.level1Name(),
        level2Name: this.level2Name(),
        routeId: this.currentAgreementId()
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save hierarchy names to localStorage:', error);
    }
  }

  loadFromLocalStorage() {
    try {
      const storageKey = this.getStorageKey();
      const stored = localStorage.getItem(storageKey);

      if (stored) {
        const data = JSON.parse(stored);

        // Validate that the stored data belongs to the current routeId
        if (data.routeId === this.currentAgreementId()) {
          this.level1Name.set(data.level1Name || 'Structure');
          this.level2Name.set(data.level2Name || 'Item');
        } else {
          // If routeId doesn't match, reset to defaults
          this.level1Name.set('Structure');
          this.level2Name.set('Item');
        }
      } else {
        // No stored data, use defaults
        this.level1Name.set('Structure');
        this.level2Name.set('Item');
      }
    } catch (error) {
      console.warn('Failed to load hierarchy names from localStorage:', error);
      // Fallback to defaults
      this.level1Name.set('Structure');
      this.level2Name.set('Item');
    }
  }

  // Method to clear localStorage for current routeId
  clearLocalStorageForCurrentProject() {
    try {
      const storageKey = this.getStorageKey();
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to clear localStorage for current project:', error);
    }
  }
}
