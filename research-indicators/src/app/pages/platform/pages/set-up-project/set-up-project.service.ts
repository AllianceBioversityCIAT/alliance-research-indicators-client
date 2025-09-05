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
  manageIndicatorModal = signal<{
    show: boolean;
    indicator?: GetIndicators;
    editingMode?: boolean;
    level1Data?: IndicatorsStructure;
    level2Data?: IndicatorItem;
    assignModal?: boolean;
  }>({
    show: false
  });
  showAllIndicators = signal<boolean>(false);
  editingElementId = signal<string | null | undefined>(null);
  structures = signal<IndicatorsStructure[]>([]);
  showCreateStructure = signal<boolean>(false);
  loadingStructures = signal<boolean>(false);
  currentAgreementId = signal<number | string | null>(null);
  // isCardsView = signal<boolean>(false);
  editingFocus = signal<boolean>(false);
  assignIndicatorsModal = signal<{
    show: boolean;
    targetLevel1?: IndicatorsStructure;
    targetLevel2?: IndicatorItem;
  }>({ show: false });
  indicatorList = signal<GetIndicators[]>([]);
  routeid = signal<string | null>(null);
  targetInfo = computed(() => this.assignIndicatorsModal().targetLevel1 || this.assignIndicatorsModal().targetLevel2);
  // Tree hierarchy signals
  level1Name = signal<string>('Level 1');
  level2Name = signal<string>('Level 2');
  editingLevel1 = signal<boolean>(false);
  editingLevel2 = signal<boolean>(false);
  // Structure table expand/collapse control
  allStructuresExpanded = signal<boolean>(true);

  strcutureGrouped = computed(() => {
    const structuresCopy = JSON.parse(JSON.stringify(this.structures()));
    const result = structuresCopy.flatMap((item: IndicatorsStructure) => {
      const { items, ...itemWithoutItems } = item;
      const isGhostItem = !item.items?.length;
      if (isGhostItem) item.items = [{ id: null, name: '', code: '', indicators: [], editing: true, ghostItem: true }];
      item.items?.map((stItem: IndicatorItem) => {
        stItem.representative = { ...itemWithoutItems, itemsCount: items?.filter((i: IndicatorItem) => !i.ghostItem).length || 0 };
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
    code: '',
    type: ''
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
    this.saveStructures();
  }

  async saveStructures() {
    this.loadingStructures.set(true);
    try {
      await this.api.POST_SyncStructures({
        structures: this.structures(),
        agreement_id: this.routeid(),
        levels: [{ name_level_1: this.level1Name(), custom_fields: [], name_level_2: this.level2Name() }]
      });
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
    this.saveStructures();
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
      console.log(res.data.levels);
      // this.level1Name.set(res.data.levels[0].name_level_1 || 'Level 1');
      // this.level2Name.set(res.data.levels[1].name_level_2 || 'Level 2');
    } catch {
      this.actions.showToast({ severity: 'error', summary: 'Error', detail: 'Failed to get structures' });
      this.structures.set([]);
    } finally {
      this.loadingStructures.set(false);
    }
  }

  assignIndicator(indicator: Indicator | GetIndicators) {
    // Level 1 - Structure indicators
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
    }

    // Level 2 - Item indicators
    if (this.assignIndicatorsModal().targetLevel2) {
      this.structures.update(prev => {
        const targetStructure = prev.find(structure => structure.items?.some(item => item.id === this.assignIndicatorsModal().targetLevel2?.id));
        if (targetStructure) {
          const targetItem = targetStructure.items?.find(item => item.id === this.assignIndicatorsModal().targetLevel2?.id);
          if (targetItem) {
            if (indicator.adding) {
              targetItem.indicators = [...(targetItem.indicators || []), indicator as Indicator];
              this.assignIndicatorsModal.update(prev => {
                const targetLevel2 = prev.targetLevel2;
                if (targetLevel2) {
                  targetLevel2.indicators = [...(targetLevel2.indicators || []), indicator as Indicator];
                  return { ...prev, targetLevel2 };
                }
                return prev;
              });
            } else {
              targetItem.indicators = (targetItem.indicators || []).filter(i => i.id != indicator.id);
              this.assignIndicatorsModal.update(prev => {
                const targetLevel2 = prev.targetLevel2;
                if (targetLevel2) {
                  targetLevel2.indicators = (targetLevel2.indicators || []).filter(i => i.id != indicator.id);
                  return { ...prev, targetLevel2 };
                }
                return prev;
              });
            }
          }
        }
        return [...prev];
      });
    }
    this.saveStructures();
  }

  // Tree hierarchy editing methods
  startEditingLevel1() {
    this.editingLevel1.set(true);
  }

  startEditingLevel2() {
    this.editingLevel2.set(true);
  }

  saveLevel1Name(newName: string) {
    this.level1Name.set(newName || 'Level 1');
    this.editingLevel1.set(false);
    this.saveStructures();
  }

  saveLevel2Name(newName: string) {
    this.level2Name.set(newName || 'Level 2');
    this.editingLevel2.set(false);
    this.saveStructures();
  }

  cancelEditingLevel1() {
    this.editingLevel1.set(false);
  }

  cancelEditingLevel2() {
    this.editingLevel2.set(false);
  }

  // Structure table expand/collapse methods
  toggleAllStructures() {
    this.allStructuresExpanded.set(!this.allStructuresExpanded());
  }

  collapseAllStructures() {
    this.allStructuresExpanded.set(false);
  }

  // LocalStorage methods with routeid validation
}
