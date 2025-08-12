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
  // Configuración principal del proyecto con indicadores por defecto
  projectConfig = signal<ProjectSetupConfiguration>({
    structures: [
      {
        id: 'structure_1755006353652',
        name: 'Example',
        code: '1',
        items: [
          {
            id: 'item_1755006362867',
            name: 'Item example',
            code: '2',
            indicators: [
              {
                id: 'indicator_1755006388233_t48yzb6he',
                name: 'Subject Test Scores',
                description: 'Average test scores for specific subject areas',
                level: 2,
                numberType: 'average',
                numberFormat: 'decimal',
                years: [2024, 2025],
                targetUnit: 'points',
                targetValue: 80,
                baseline: 65,
                isActive: true
              }
            ]
          },
          {
            id: 'item_1755006378534',
            name: 'item 2',
            code: '3',
            indicators: []
          }
        ],
        indicators: [
          {
            id: 'indicator_1755006383217_0rbvp23pn',
            name: 'Academic Performance Index',
            description: 'Overall academic performance measurement across all subjects',
            level: 1,
            numberType: 'average',
            numberFormat: 'decimal',
            years: [2024, 2025],
            targetUnit: 'score (0-100)',
            targetValue: 85,
            baseline: 70,
            isActive: true
          }
        ]
      },
      {
        id: 'structure_1755006370134',
        name: 'example 2',
        code: '1',
        items: [],
        indicators: []
      }
    ]
  });

  // Indicadores predefinidos disponibles para seleccionar
  defaultIndicators = signal<ProjectIndicator[]>([
    // Level 1 Indicators (Structures)
    {
      id: 'default_ind1',
      name: 'Academic Performance Index',
      description: 'Overall academic performance measurement across all subjects',
      level: 1,
      numberType: 'average',
      numberFormat: 'decimal',
      years: [2024, 2025],
      targetUnit: 'score (0-100)',
      targetValue: 85,
      baseline: 70,
      isActive: true
    },
    {
      id: 'default_ind2',
      name: 'Student Engagement Rate',
      description: 'Percentage of students actively participating in learning activities',
      level: 1,
      numberType: 'average',
      numberFormat: 'decimal',
      years: [2024, 2025],
      targetUnit: '%',
      targetValue: 90,
      baseline: 75,
      isActive: true
    },
    {
      id: 'default_ind3',
      name: 'Curriculum Completion Rate',
      description: 'Percentage of curriculum objectives successfully completed',
      level: 1,
      numberType: 'average',
      numberFormat: 'decimal',
      years: [2024, 2025, 2026],
      targetUnit: '%',
      targetValue: 95,
      baseline: 80,
      isActive: true
    },
    {
      id: 'default_ind4',
      name: 'Teacher Satisfaction Score',
      description: 'Overall teacher satisfaction with curriculum and resources',
      level: 1,
      numberType: 'average',
      numberFormat: 'decimal',
      years: [2024, 2025],
      targetUnit: 'score (1-10)',
      targetValue: 8,
      baseline: 6.5,
      isActive: true
    },

    // Level 2 Indicators (Items)
    {
      id: 'default_ind5',
      name: 'Subject Test Scores',
      description: 'Average test scores for specific subject areas',
      level: 2,
      numberType: 'average',
      numberFormat: 'decimal',
      years: [2024, 2025],
      targetUnit: 'points',
      targetValue: 80,
      baseline: 65,
      isActive: true
    },
    {
      id: 'default_ind6',
      name: 'Assignment Completion Rate',
      description: 'Percentage of assignments completed on time by students',
      level: 2,
      numberType: 'average',
      numberFormat: 'decimal',
      years: [2024, 2025],
      targetUnit: '%',
      targetValue: 85,
      baseline: 70,
      isActive: true
    },
    {
      id: 'default_ind7',
      name: 'Learning Objective Mastery',
      description: 'Percentage of students mastering specific learning objectives',
      level: 2,
      numberType: 'average',
      numberFormat: 'decimal',
      years: [2024, 2025, 2026],
      targetUnit: '%',
      targetValue: 90,
      baseline: 75,
      isActive: true
    },
    {
      id: 'default_ind8',
      name: 'Resource Utilization Rate',
      description: 'How effectively educational resources are being used',
      level: 2,
      numberType: 'average',
      numberFormat: 'decimal',
      years: [2024, 2025],
      targetUnit: '%',
      targetValue: 80,
      baseline: 60,
      isActive: true
    },
    {
      id: 'default_ind9',
      name: 'Student Progress Tracking',
      description: 'Individual student progress monitoring and improvement',
      level: 2,
      numberType: 'count',
      numberFormat: 'number',
      years: [2024, 2025],
      targetUnit: 'students tracked',
      targetValue: 100,
      baseline: 60,
      isActive: true
    },
    {
      id: 'default_ind10',
      name: 'Skill Development Index',
      description: 'Development of specific skills within subject areas',
      level: 2,
      numberType: 'average',
      numberFormat: 'decimal',
      years: [2024, 2025],
      targetUnit: 'skill level (1-5)',
      targetValue: 4,
      baseline: 3,
      isActive: true
    }
  ]);

  // Formularios para nuevos elementos
  newStructureForm = signal<NewStructureForm>({ name: '', code: '' });
  newItemForm = signal<NewItemForm>({ name: '', code: '', parentStructureId: '' });
  newIndicatorForm = signal<NewIndicatorForm>({
    name: '',
    description: '',
    level: null,
    numberType: null,
    numberFormat: null,
    years: [],
    targetUnit: '',
    targetValue: null,
    baseline: null
  });

  // Estados de UI

  selectedElementForIndicators = signal<{ type: 'structure' | 'item'; id: string } | null>(null);
  editingElementId = signal<string | null>(null);
  selectedStructureIndex = signal<number>(0);
  currentView = signal<'structures' | 'indicators'>('structures');

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

  // Combinamos indicadores por defecto con los del proyecto para la vista principal
  allIndicatorsWithDefaults = computed(() => {
    return [...this.defaultIndicators(), ...this.allIndicators()];
  });

  level1Indicators = computed(() => this.allIndicatorsWithDefaults().filter(ind => ind.level === 1 && ind.isActive));

  level2Indicators = computed(() => this.allIndicatorsWithDefaults().filter(ind => ind.level === 2 && ind.isActive));

  isProjectValid = computed(() => {
    const config = this.projectConfig();
    return config.structures.length > 0 && config.structures.some(s => s.items.length > 0);
  });

  totalItems = computed(() => {
    const config = this.projectConfig();
    return config.structures.reduce((acc, s) => acc + s.items.length, 0);
  });

  // Indicadores por defecto filtrados por nivel
  defaultLevel1Indicators = computed(() => this.defaultIndicators().filter(ind => ind.level === 1));
  defaultLevel2Indicators = computed(() => this.defaultIndicators().filter(ind => ind.level === 2));

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

      const updatedStructures = [...config.structures, newStructure];
      this.projectConfig.set({
        ...config,
        structures: updatedStructures
      });

      // Seleccionar automáticamente el nuevo tab
      this.selectedStructureIndex.set(updatedStructures.length - 1);

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
    const currentIndex = this.selectedStructureIndex();
    const structureIndex = config.structures.findIndex(s => s.id === structureId);

    const updatedStructures = config.structures.filter(structure => structure.id !== structureId);

    this.projectConfig.set({
      ...config,
      structures: updatedStructures
    });

    // Ajustar el índice seleccionado si es necesario
    if (updatedStructures.length === 0) {
      this.selectedStructureIndex.set(0);
    } else if (structureIndex <= currentIndex && currentIndex > 0) {
      this.selectedStructureIndex.set(currentIndex - 1);
    } else if (currentIndex >= updatedStructures.length) {
      this.selectedStructureIndex.set(updatedStructures.length - 1);
    }
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
  openIndicatorModal(level?: 1 | 2): void {
    this.newIndicatorForm.set({
      name: '',
      description: '',
      level: level ?? null,
      numberType: null,
      numberFormat: null,
      years: [],
      targetUnit: '',
      targetValue: null,
      baseline: null
    });
    // this.showIndicatorModal.set(true);
  }

  saveIndicator(): void {
    const editingId = this.editingElementId();

    // Si estamos editando un indicador por defecto
    if (editingId && this.isDefaultIndicator(editingId)) {
      this.saveDefaultIndicator();
      return;
    }

    // Si estamos creando un nuevo indicador por defecto
    if (editingId === 'new-default-indicator') {
      this.saveNewDefaultIndicator();
      return;
    }

    const form = this.newIndicatorForm();
    if (
      form.name.trim() &&
      form.description.trim() &&
      form.years.length > 0 &&
      form.targetUnit.trim() &&
      form.level !== null &&
      form.numberType !== null &&
      form.numberFormat !== null
    ) {
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
      // this.showIndicatorModal.set(false);

      // Si hay un elemento seleccionado, asignar directamente
      const selected = this.selectedElementForIndicators();
      if (selected) {
        this.assignNewIndicator(newIndicator, selected.type, selected.id);
        this.selectedElementForIndicators.set(null);
      }
    }
  }

  removeIndicator(indicatorId: string): void {
    // Si es un indicador por defecto, usar el método específico
    if (this.isDefaultIndicator(indicatorId)) {
      this.removeDefaultIndicator(indicatorId);
      return;
    }

    // Si es un indicador del proyecto, removerlo de las estructuras/items
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
    // this.showAssignIndicatorModal.set(true);
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
  createIndicatorForElement(type: 'structure' | 'item'): void {
    const level = type === 'structure' ? 1 : 2;
    this.newIndicatorForm.set({
      name: '',
      description: '',
      level,
      numberType: null,
      numberFormat: null,
      years: [],
      targetUnit: '',
      targetValue: null,
      baseline: null
    });

    // Cerrar modal de asignación y abrir modal de creación
    // this.showAssignIndicatorModal.set(false);
    // this.showIndicatorModal.set(true);
  }

  // Métodos para cambiar de vista
  showStructuresView(): void {
    this.currentView.set('structures');
  }

  showIndicatorsView(): void {
    this.currentView.set('indicators');
  }

  // Método para resetear el formulario de indicadores
  resetIndicatorForm(): void {
    this.newIndicatorForm.set({
      name: '',
      description: '',
      level: null,
      numberType: null,
      numberFormat: null,
      years: [],
      targetUnit: '',
      targetValue: null,
      baseline: null
    });
  }

  // ============= MÉTODOS PARA GESTOR DE INDICADORES POR DEFECTO =============

  // Verificar si un indicador es por defecto (empieza con 'default_')
  isDefaultIndicator(indicatorId: string): boolean {
    return indicatorId.startsWith('default_');
  }

  // Editar un indicador por defecto
  editDefaultIndicator(indicator: ProjectIndicator): void {
    this.newIndicatorForm.set({
      name: indicator.name,
      description: indicator.description,
      level: indicator.level,
      numberType: indicator.numberType,
      numberFormat: indicator.numberFormat,
      years: [...indicator.years],
      targetUnit: indicator.targetUnit,
      targetValue: indicator.targetValue,
      baseline: indicator.baseline
    });
    this.editingElementId.set(indicator.id);
    // this.showIndicatorModal.set(true);
  }

  // Guardar cambios en un indicador por defecto
  saveDefaultIndicator(): void {
    const form = this.newIndicatorForm();
    const editingId = this.editingElementId();

    if (!editingId || !this.isDefaultIndicator(editingId)) return;

    const defaultIndicators = this.defaultIndicators();
    const updatedIndicators = defaultIndicators.map(indicator => {
      if (indicator.id !== editingId) return indicator;
      if (form.level === null || form.numberType === null || form.numberFormat === null) return indicator;
      return {
        ...indicator,
        name: form.name.trim(),
        description: form.description.trim(),
        level: form.level,
        numberType: form.numberType,
        numberFormat: form.numberFormat,
        years: form.years,
        targetUnit: form.targetUnit,
        targetValue: form.targetValue,
        baseline: form.baseline
      } as ProjectIndicator;
    });

    this.defaultIndicators.set(updatedIndicators);
    // this.showIndicatorModal.set(false);
    this.editingElementId.set(null);
    this.resetIndicatorForm();
  }

  // Eliminar un indicador por defecto
  removeDefaultIndicator(indicatorId: string): void {
    if (!this.isDefaultIndicator(indicatorId)) return;

    const currentDefaults = this.defaultIndicators();
    const updatedDefaults = currentDefaults.filter(ind => ind.id !== indicatorId);
    this.defaultIndicators.set(updatedDefaults);
  }

  // Crear un nuevo indicador por defecto
  createNewDefaultIndicator(level: 1 | 2): void {
    this.newIndicatorForm.set({
      name: '',
      description: '',
      level: level,
      numberType: null,
      numberFormat: null,
      years: [],
      targetUnit: '',
      targetValue: null,
      baseline: null
    });
    this.editingElementId.set('new-default-indicator');
    // this.showIndicatorModal.set(true);
  }

  // Manejar el cierre del diálogo de indicador para limpiar contexto
  handleIndicatorDialogHide(): void {
    this.selectedElementForIndicators.set(null);
    // Si no estamos editando un indicador por defecto, limpiar también el id de edición
    if (this.editingElementId() && this.editingElementId() !== 'new-default-indicator') {
      this.editingElementId.set(null);
    }
  }

  closeIndicatorDialog(): void {
    // this.showIndicatorModal.set(false);
    this.handleIndicatorDialogHide();
  }

  // Guardar un nuevo indicador por defecto
  saveNewDefaultIndicator(): void {
    const form = this.newIndicatorForm();
    if (form.level === null || form.numberType === null || form.numberFormat === null) return;
    const newIndicator: ProjectIndicator = {
      id: `default_ind${Date.now()}`,
      name: form.name.trim(),
      description: form.description.trim(),
      level: form.level,
      numberType: form.numberType,
      numberFormat: form.numberFormat,
      years: form.years,
      targetUnit: form.targetUnit,
      targetValue: form.targetValue,
      baseline: form.baseline,
      isActive: true
    };

    const currentDefaults = this.defaultIndicators();
    this.defaultIndicators.set([...currentDefaults, newIndicator]);

    // this.showIndicatorModal.set(false);
    this.editingElementId.set(null);
    this.resetIndicatorForm();
  }
}
