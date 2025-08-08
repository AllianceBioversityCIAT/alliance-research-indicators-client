import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { AccordionModule } from 'primeng/accordion';
import { DividerModule } from 'primeng/divider';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import {
  ProjectSetupConfiguration,
  ProjectStructure,
  ProjectItem,
  ProjectIndicator,
  NewStructureForm,
  NewItemForm,
  NewIndicatorForm,
  NUMBER_TYPE_OPTIONS,
  NUMBER_FORMAT_OPTIONS,
  AVAILABLE_YEARS
} from '../../../../shared/interfaces/project-setup.interface';

@Component({
  selector: 'app-set-up-project',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    SelectModule,
    InputNumberModule,
    MultiSelectModule,
    AccordionModule,
    DividerModule,
    ToolbarModule,
    TooltipModule,
    DialogModule,
    TabViewModule,
    TagModule,
    CheckboxModule,
    TextareaModule
  ],
  templateUrl: './set-up-project.component.html',
  styleUrl: './set-up-project.component.scss'
})
export default class SetUpProjectComponent {
  // Configuración principal del proyecto con datos dummy
  projectConfig = signal<ProjectSetupConfiguration>({
    structures: [
      {
        id: '1',
        name: 'Materias',
        code: 'MAT001',
        items: [
          {
            id: 'item1',
            name: 'Español',
            code: '1.1',
            indicators: [
              {
                id: 'ind4',
                name: 'New Varieties Released',
                description: 'Number of new crop varieties developed and released',
                level: 2,
                numberType: 'count',
                numberFormat: 'number',
                years: [2023, 2024, 2025],
                targetUnit: 'varieties',
                targetValue: 12,
                baseline: 5,
                isActive: true
              },
              {
                id: 'ind5',
                name: 'Yield Improvement',
                description: 'Average yield increase from new varieties',
                level: 2,
                numberType: 'average',
                numberFormat: 'decimal',
                years: [2024, 2025],
                targetUnit: '%',
                targetValue: 30,
                baseline: 15,
                isActive: true
              }
            ],
            isEditing: false
          },
          {
            id: 'item2',
            name: 'Matemáticas',
            code: '1.2',
            indicators: [],
            isEditing: false
          }
        ],
        indicators: [
          {
            id: 'ind1',
            name: 'Productivity Index',
            description: 'Measures overall agricultural productivity improvement',
            level: 1,
            numberType: 'sum',
            numberFormat: 'number',
            years: [2023, 2024, 2025],
            targetUnit: 'tons/hectare',
            targetValue: 5.2,
            baseline: 3.8,
            isActive: true
          },
          {
            id: 'ind2',
            name: 'Innovation Adoption Rate',
            description: 'Percentage of farmers adopting new technologies',
            level: 1,
            numberType: 'average',
            numberFormat: 'decimal',
            years: [2023, 2024],
            targetUnit: '%',
            targetValue: 75,
            baseline: 45,
            isActive: true
          }
        ],
        isEditing: false
      },
      {
        id: '2',
        name: 'Ciencias',
        code: 'CIE002',
        items: [
          {
            id: 'item3',
            name: 'Biología',
            code: '2.1',
            indicators: [
              {
                id: 'ind6',
                name: 'Water Use Efficiency',
                description: 'Improvement in water usage efficiency',
                level: 2,
                numberType: 'average',
                numberFormat: 'decimal',
                years: [2023, 2024],
                targetUnit: 'L/kg',
                targetValue: 800,
                baseline: 1200,
                isActive: true
              }
            ],
            isEditing: false
          }
        ],
        indicators: [
          {
            id: 'ind3',
            name: 'Climate Resilience Score',
            description: 'Overall climate adaptation effectiveness measure',
            level: 1,
            numberType: 'average',
            numberFormat: 'number',
            years: [2024, 2025],
            targetUnit: 'score',
            targetValue: 8.5,
            baseline: 6.2,
            isActive: true
          }
        ],
        isEditing: false
      }
    ]
  });

  // Formularios para nuevos elementos
  newStructureForm = signal<NewStructureForm>({ name: '', code: '' });
  newItemForm = signal<NewItemForm>({ name: '', code: '', parentStructureId: '' });
  newIndicatorForm = signal<NewIndicatorForm>({
    name: '',
    description: '',
    level: 1,
    numberType: 'sum',
    numberFormat: 'number',
    years: [],
    targetUnit: '',
    targetValue: null,
    baseline: null
  });

  // Estados de UI
  showIndicatorModal = signal<boolean>(false);
  showAssignIndicatorModal = signal<boolean>(false);
  selectedElementForIndicators = signal<{ type: 'structure' | 'item'; id: string } | null>(null);
  editingElementId = signal<string | null>(null);

  // Opciones disponibles
  numberTypeOptions = NUMBER_TYPE_OPTIONS;
  numberFormatOptions = NUMBER_FORMAT_OPTIONS;
  availableYears = AVAILABLE_YEARS.map(year => ({ label: year.toString(), value: year }));

  // Computed properties
  allIndicators = computed(() => {
    const config = this.projectConfig();
    const indicators: ProjectIndicator[] = [];

    config.structures.forEach(structure => {
      indicators.push(...structure.indicators);
      structure.items.forEach(item => {
        indicators.push(...item.indicators);
      });
    });

    return indicators;
  });

  level1Indicators = computed(() => this.allIndicators().filter(ind => ind.level === 1 && ind.isActive));

  level2Indicators = computed(() => this.allIndicators().filter(ind => ind.level === 2 && ind.isActive));

  isProjectValid = computed(() => {
    const config = this.projectConfig();
    return config.structures.length > 0 && config.structures.some(s => s.items.length > 0);
  });

  totalItems = computed(() => {
    const config = this.projectConfig();
    return config.structures.reduce((acc, s) => acc + s.items.length, 0);
  });

  // ============= MÉTODOS PARA ESTRUCTURAS =============
  startAddingStructure(): void {
    this.newStructureForm.set({ name: '', code: '' });
    this.editingElementId.set('new-structure');
  }

  saveStructure(): void {
    const form = this.newStructureForm();
    if (form.name.trim() && form.code.trim()) {
      const config = this.projectConfig();
      const newStructure: ProjectStructure = {
        id: `structure_${Date.now()}`,
        name: form.name.trim(),
        code: form.code.trim(),
        items: [],
        indicators: []
      };

      this.projectConfig.set({
        ...config,
        structures: [...config.structures, newStructure]
      });

      this.newStructureForm.set({ name: '', code: '' });
      this.editingElementId.set(null);
    }
  }

  editStructure(structureId: string): void {
    const config = this.projectConfig();
    const structure = config.structures.find(s => s.id === structureId);
    if (structure) {
      this.newStructureForm.set({ name: structure.name, code: structure.code });
      this.editingElementId.set(structureId);
    }
  }

  updateStructure(structureId: string): void {
    const form = this.newStructureForm();
    if (form.name.trim() && form.code.trim()) {
      const config = this.projectConfig();
      const updatedStructures = config.structures.map(structure =>
        structure.id === structureId ? { ...structure, name: form.name.trim(), code: form.code.trim() } : structure
      );

      this.projectConfig.set({
        ...config,
        structures: updatedStructures
      });

      this.newStructureForm.set({ name: '', code: '' });
      this.editingElementId.set(null);
    }
  }

  removeStructure(structureId: string): void {
    const config = this.projectConfig();
    this.projectConfig.set({
      ...config,
      structures: config.structures.filter(structure => structure.id !== structureId)
    });
  }

  cancelStructureEdit(): void {
    this.newStructureForm.set({ name: '', code: '' });
    this.editingElementId.set(null);
  }

  // ============= MÉTODOS PARA ITEMS =============
  startAddingItem(parentStructureId: string): void {
    this.newItemForm.set({ name: '', code: '', parentStructureId });
    this.editingElementId.set(`new-item-${parentStructureId}`);
  }

  saveItem(): void {
    const form = this.newItemForm();
    if (form.name.trim() && form.code.trim() && form.parentStructureId) {
      const config = this.projectConfig();
      const newItem: ProjectItem = {
        id: `item_${Date.now()}`,
        name: form.name.trim(),
        code: form.code.trim(),
        indicators: []
      };

      const updatedStructures = config.structures.map(structure =>
        structure.id === form.parentStructureId ? { ...structure, items: [...structure.items, newItem] } : structure
      );

      this.projectConfig.set({
        ...config,
        structures: updatedStructures
      });

      this.newItemForm.set({ name: '', code: '', parentStructureId: '' });
      this.editingElementId.set(null);
    }
  }

  editItem(structureId: string, itemId: string): void {
    const config = this.projectConfig();
    const structure = config.structures.find(s => s.id === structureId);
    const item = structure?.items.find(i => i.id === itemId);
    if (item) {
      this.newItemForm.set({
        name: item.name,
        code: item.code,
        parentStructureId: structureId
      });
      this.editingElementId.set(itemId);
    }
  }

  updateItem(itemId: string): void {
    const form = this.newItemForm();
    if (form.name.trim() && form.code.trim()) {
      const config = this.projectConfig();
      const updatedStructures = config.structures.map(structure => ({
        ...structure,
        items: structure.items.map(item => (item.id === itemId ? { ...item, name: form.name.trim(), code: form.code.trim() } : item))
      }));

      this.projectConfig.set({
        ...config,
        structures: updatedStructures
      });

      this.newItemForm.set({ name: '', code: '', parentStructureId: '' });
      this.editingElementId.set(null);
    }
  }

  removeItem(structureId: string, itemId: string): void {
    const config = this.projectConfig();
    const updatedStructures = config.structures.map(structure =>
      structure.id === structureId ? { ...structure, items: structure.items.filter(item => item.id !== itemId) } : structure
    );

    this.projectConfig.set({
      ...config,
      structures: updatedStructures
    });
  }

  cancelItemEdit(): void {
    this.newItemForm.set({ name: '', code: '', parentStructureId: '' });
    this.editingElementId.set(null);
  }

  // ============= MÉTODOS PARA INDICADORES =============
  openIndicatorModal(level: 1 | 2 = 1): void {
    this.newIndicatorForm.set({
      name: '',
      description: '',
      level,
      numberType: 'sum',
      numberFormat: 'number',
      years: [],
      targetUnit: '',
      targetValue: null,
      baseline: null
    });
    this.showIndicatorModal.set(true);
  }

  saveIndicator(): void {
    const form = this.newIndicatorForm();
    if (form.name.trim() && form.description.trim() && form.years.length > 0 && form.targetUnit.trim()) {
      const newIndicator: ProjectIndicator = {
        id: `indicator_${Date.now()}`,
        name: form.name.trim(),
        description: form.description.trim(),
        level: form.level,
        numberType: form.numberType,
        numberFormat: form.numberFormat,
        years: form.years,
        targetUnit: form.targetUnit.trim(),
        targetValue: form.targetValue,
        baseline: form.baseline,
        isActive: true
      };

      // Los indicadores ahora se agregan directamente a estructuras o items, no a una lista global
      // Este método puede ser usado cuando se asigne posteriormente
      this.showIndicatorModal.set(false);

      // Si hay un elemento seleccionado, asignar directamente
      const selected = this.selectedElementForIndicators();
      if (selected) {
        this.assignNewIndicator(newIndicator, selected.type, selected.id);
        this.selectedElementForIndicators.set(null);
      }
    }
  }

  removeIndicator(indicatorId: string): void {
    const config = this.projectConfig();
    const updatedStructures = config.structures.map(structure => ({
      ...structure,
      indicators: structure.indicators.filter(ind => ind.id !== indicatorId),
      items: structure.items.map(item => ({
        ...item,
        indicators: item.indicators.filter(ind => ind.id !== indicatorId)
      }))
    }));

    this.projectConfig.set({
      ...config,
      structures: updatedStructures
    });
  }

  // ============= MÉTODOS PARA ASIGNAR INDICADORES =============
  openAssignIndicatorModal(type: 'structure' | 'item', elementId: string): void {
    this.selectedElementForIndicators.set({ type, id: elementId });
    this.showAssignIndicatorModal.set(true);
  }

  assignNewIndicator(indicator: ProjectIndicator, type: 'structure' | 'item', elementId: string): void {
    const config = this.projectConfig();

    if (type === 'structure') {
      const updatedStructures = config.structures.map(structure =>
        structure.id === elementId ? { ...structure, indicators: [...structure.indicators, indicator] } : structure
      );

      this.projectConfig.set({
        ...config,
        structures: updatedStructures
      });
    } else {
      const updatedStructures = config.structures.map(structure => ({
        ...structure,
        items: structure.items.map(item => (item.id === elementId ? { ...item, indicators: [...item.indicators, indicator] } : item))
      }));

      this.projectConfig.set({
        ...config,
        structures: updatedStructures
      });
    }
  }

  removeIndicatorFromElement(elementType: 'structure' | 'item', structureId: string, elementId: string, indicatorId: string): void {
    const config = this.projectConfig();

    if (elementType === 'structure') {
      const updatedStructures = config.structures.map(structure =>
        structure.id === elementId ? { ...structure, indicators: structure.indicators.filter(ind => ind.id !== indicatorId) } : structure
      );

      this.projectConfig.set({
        ...config,
        structures: updatedStructures
      });
    } else {
      const updatedStructures = config.structures.map(structure => ({
        ...structure,
        items: structure.items.map(item =>
          item.id === elementId ? { ...item, indicators: item.indicators.filter(ind => ind.id !== indicatorId) } : item
        )
      }));

      this.projectConfig.set({
        ...config,
        structures: updatedStructures
      });
    }
  }

  getIndicatorById(indicatorId: string): ProjectIndicator | undefined {
    const allIndicators = this.allIndicators();
    return allIndicators.find(ind => ind.id === indicatorId);
  }

  getAvailableIndicatorsForElement(): ProjectIndicator[] {
    // Para la nueva estructura, los indicadores están embebidos directamente
    // Este método ahora retorna una lista vacía ya que los indicadores se crean directamente
    return [];
  }

  // ============= MÉTODOS GENERALES =============
  saveConfiguration(): void {
    if (this.isProjectValid()) {
      // Aquí integrarías con tu servicio para guardar la configuración
      // console.warn('Saving project configuration:', this.projectConfig());
    }
  }

  resetConfiguration(): void {
    this.projectConfig.set({
      structures: []
    });
    this.newStructureForm.set({ name: '', code: '' });
    this.newItemForm.set({ name: '', code: '', parentStructureId: '' });
    this.editingElementId.set(null);
  }

  exportConfiguration(): void {
    const config = this.projectConfig();
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `project-setup-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  // Métodos de trackBy para optimizar el rendering
  trackByElementId(index: number, item: { id: string }): string {
    return item.id;
  }

  // Helper method para verificar si una estructura tiene items
  hasItems(structureId: string): boolean {
    const config = this.projectConfig();
    const structure = config.structures.find(s => s.id === structureId);
    return structure ? structure.items.length > 0 : false;
  }

  // Obtener nombre del elemento para mostrar en UI
  getElementName(type: 'structure' | 'item', elementId: string): string {
    const config = this.projectConfig();
    if (type === 'structure') {
      const structure = config.structures.find(s => s.id === elementId);
      return structure?.name || 'this structure';
    } else {
      for (const structure of config.structures) {
        const item = structure.items.find(i => i.id === elementId);
        if (item) return item.name;
      }
      return 'this item';
    }
  }

  // Crear indicador directamente para un elemento específico
  createIndicatorForElement(type: 'structure' | 'item', elementId: string): void {
    const level = type === 'structure' ? 1 : 2;
    this.newIndicatorForm.set({
      name: '',
      description: `Indicator for ${this.getElementName(type, elementId)}`,
      level,
      numberType: 'sum',
      numberFormat: 'number',
      years: [],
      targetUnit: '',
      targetValue: null,
      baseline: null
    });

    // Cerrar modal de asignación y abrir modal de creación
    this.showAssignIndicatorModal.set(false);
    this.showIndicatorModal.set(true);
  }
}
