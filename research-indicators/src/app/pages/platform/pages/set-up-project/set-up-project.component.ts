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
  ProjectComponent,
  ProjectSubComponent,
  ProjectIndicator,
  NewComponentForm,
  NewSubComponentForm,
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
    components: [
      {
        id: '1',
        name: 'Estructure A',
        code: 'AGR001',
        indicators: ['ind1', 'ind2', 'ind7'],
        isEditing: false
      },
      {
        id: '2',
        name: 'Estructure B',
        code: 'CLI002',
        indicators: ['ind3', 'ind8'],
        isEditing: false
      }
    ],
    subComponents: [
      {
        id: 'sub1',
        name: 'Sub-estructure A1',
        code: 'CVD001',
        parentComponentId: '1',
        indicators: ['ind4', 'ind5'],
        isEditing: false
      },
      {
        id: 'sub2',
        name: 'Sub-estructure A2',
        code: 'SM002',
        parentComponentId: '1',
        indicators: [],
        isEditing: false
      },
      {
        id: 'sub3',
        name: 'Sub-estructure B1',
        code: 'WC003',
        parentComponentId: '2',
        indicators: ['ind6'],
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
      },
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
      },
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
      },
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
      },
      {
        id: 'ind7',
        name: 'Technology Transfer Rate',
        description: 'Rate of technology adoption across regions',
        level: 1,
        numberType: 'count',
        numberFormat: 'number',
        years: [2023, 2024, 2025],
        targetUnit: 'regions',
        targetValue: 25,
        baseline: 12,
        isActive: true
      },
      {
        id: 'ind8',
        name: 'Carbon Footprint Reduction',
        description: 'Total reduction in CO2 emissions',
        level: 1,
        numberType: 'sum',
        numberFormat: 'decimal',
        years: [2024, 2025, 2026],
        targetUnit: 'tons CO2',
        targetValue: 5000,
        baseline: 8500,
        isActive: true
      },
      {
        id: 'ind9',
        name: 'Sustainability Score',
        description: 'Overall sustainability performance index',
        level: 1,
        numberType: 'average',
        numberFormat: 'decimal',
        years: [2023, 2024, 2025],
        targetUnit: 'score',
        targetValue: 8.0,
        baseline: 5.5,
        isActive: true
      },
      {
        id: 'ind10',
        name: 'Community Engagement',
        description: 'Level of community participation in sustainable practices',
        level: 1,
        numberType: 'yes/no',
        numberFormat: 'number',
        years: [2024, 2025],
        targetUnit: 'communities',
        targetValue: 15,
        baseline: 8,
        isActive: true
      },
      {
        id: 'ind11',
        name: 'Solar Panel Installation',
        description: 'Number of solar panels installed in agricultural facilities',
        level: 2,
        numberType: 'count',
        numberFormat: 'number',
        years: [2023, 2024, 2025],
        targetUnit: 'panels',
        targetValue: 150,
        baseline: 45,
        isActive: true
      },
      {
        id: 'ind12',
        name: 'Energy Cost Savings',
        description: 'Percentage reduction in energy costs',
        level: 2,
        numberType: 'average',
        numberFormat: 'decimal',
        years: [2024, 2025],
        targetUnit: '%',
        targetValue: 35,
        baseline: 10,
        isActive: true
      }
    ]
  });

  // Formularios para nuevos elementos
  newComponentForm = signal<NewComponentForm>({ name: '', code: '' });
  newSubComponentForm = signal<NewSubComponentForm>({ name: '', code: '', parentComponentId: '' });
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
  selectedElementForIndicators = signal<{ type: 'component' | 'subcomponent'; id: string } | null>(null);
  editingElementId = signal<string | null>(null);

  // Opciones disponibles
  numberTypeOptions = NUMBER_TYPE_OPTIONS;
  numberFormatOptions = NUMBER_FORMAT_OPTIONS;
  availableYears = AVAILABLE_YEARS.map(year => ({ label: year.toString(), value: year }));

  // Computed properties
  componentsWithSubComponents = computed(() => {
    const config = this.projectConfig();
    return config.components.map(comp => ({
      ...comp,
      subComponents: config.subComponents.filter(sub => sub.parentComponentId === comp.id)
    }));
  });

  level1Indicators = computed(() => this.projectConfig().indicators.filter(ind => ind.level === 1 && ind.isActive));

  level2Indicators = computed(() => this.projectConfig().indicators.filter(ind => ind.level === 2 && ind.isActive));

  isProjectValid = computed(() => {
    const config = this.projectConfig();
    return config.components.length > 0 && config.subComponents.length > 0;
  });

  // ============= MÉTODOS PARA COMPONENTES =============
  startAddingComponent(): void {
    this.newComponentForm.set({ name: '', code: '' });
    this.editingElementId.set('new-component');
  }

  saveComponent(): void {
    const form = this.newComponentForm();
    if (form.name.trim() && form.code.trim()) {
      const config = this.projectConfig();
      const newComponent: ProjectComponent = {
        id: `component_${Date.now()}`,
        name: form.name.trim(),
        code: form.code.trim(),
        indicators: []
      };

      this.projectConfig.set({
        ...config,
        components: [...config.components, newComponent]
      });

      this.newComponentForm.set({ name: '', code: '' });
      this.editingElementId.set(null);
    }
  }

  editComponent(componentId: string): void {
    const config = this.projectConfig();
    const component = config.components.find(c => c.id === componentId);
    if (component) {
      this.newComponentForm.set({ name: component.name, code: component.code });
      this.editingElementId.set(componentId);
    }
  }

  updateComponent(componentId: string): void {
    const form = this.newComponentForm();
    if (form.name.trim() && form.code.trim()) {
      const config = this.projectConfig();
      const updatedComponents = config.components.map(comp =>
        comp.id === componentId ? { ...comp, name: form.name.trim(), code: form.code.trim() } : comp
      );

      this.projectConfig.set({
        ...config,
        components: updatedComponents
      });

      this.newComponentForm.set({ name: '', code: '' });
      this.editingElementId.set(null);
    }
  }

  removeComponent(componentId: string): void {
    const config = this.projectConfig();
    // También eliminar sub-componentes relacionados
    const updatedSubComponents = config.subComponents.filter(sub => sub.parentComponentId !== componentId);

    this.projectConfig.set({
      ...config,
      components: config.components.filter(comp => comp.id !== componentId),
      subComponents: updatedSubComponents
    });
  }

  cancelComponentEdit(): void {
    this.newComponentForm.set({ name: '', code: '' });
    this.editingElementId.set(null);
  }

  // ============= MÉTODOS PARA SUB-COMPONENTES =============
  startAddingSubComponent(parentComponentId: string): void {
    this.newSubComponentForm.set({ name: '', code: '', parentComponentId });
    this.editingElementId.set(`new-subcomponent-${parentComponentId}`);
  }

  saveSubComponent(): void {
    const form = this.newSubComponentForm();
    if (form.name.trim() && form.code.trim() && form.parentComponentId) {
      const config = this.projectConfig();
      const newSubComponent: ProjectSubComponent = {
        id: `subcomponent_${Date.now()}`,
        parentComponentId: form.parentComponentId,
        name: form.name.trim(),
        code: form.code.trim(),
        indicators: []
      };

      this.projectConfig.set({
        ...config,
        subComponents: [...config.subComponents, newSubComponent]
      });

      this.newSubComponentForm.set({ name: '', code: '', parentComponentId: '' });
      this.editingElementId.set(null);
    }
  }

  editSubComponent(subComponentId: string): void {
    const config = this.projectConfig();
    const subComponent = config.subComponents.find(s => s.id === subComponentId);
    if (subComponent) {
      this.newSubComponentForm.set({
        name: subComponent.name,
        code: subComponent.code,
        parentComponentId: subComponent.parentComponentId
      });
      this.editingElementId.set(subComponentId);
    }
  }

  updateSubComponent(subComponentId: string): void {
    const form = this.newSubComponentForm();
    if (form.name.trim() && form.code.trim()) {
      const config = this.projectConfig();
      const updatedSubComponents = config.subComponents.map(sub =>
        sub.id === subComponentId ? { ...sub, name: form.name.trim(), code: form.code.trim() } : sub
      );

      this.projectConfig.set({
        ...config,
        subComponents: updatedSubComponents
      });

      this.newSubComponentForm.set({ name: '', code: '', parentComponentId: '' });
      this.editingElementId.set(null);
    }
  }

  removeSubComponent(subComponentId: string): void {
    const config = this.projectConfig();
    this.projectConfig.set({
      ...config,
      subComponents: config.subComponents.filter(sub => sub.id !== subComponentId)
    });
  }

  cancelSubComponentEdit(): void {
    this.newSubComponentForm.set({ name: '', code: '', parentComponentId: '' });
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
      const config = this.projectConfig();
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

      this.projectConfig.set({
        ...config,
        indicators: [...config.indicators, newIndicator]
      });

      this.showIndicatorModal.set(false);
    }
  }

  removeIndicator(indicatorId: string): void {
    const config = this.projectConfig();
    // Remover el indicador de todos los componentes y sub-componentes
    const updatedComponents = config.components.map(comp => ({
      ...comp,
      indicators: comp.indicators.filter(id => id !== indicatorId)
    }));

    const updatedSubComponents = config.subComponents.map(sub => ({
      ...sub,
      indicators: sub.indicators.filter(id => id !== indicatorId)
    }));

    this.projectConfig.set({
      ...config,
      components: updatedComponents,
      subComponents: updatedSubComponents,
      indicators: config.indicators.filter(ind => ind.id !== indicatorId)
    });
  }

  // ============= MÉTODOS PARA ASIGNAR INDICADORES =============
  openAssignIndicatorModal(type: 'component' | 'subcomponent', elementId: string): void {
    this.selectedElementForIndicators.set({ type, id: elementId });
    this.showAssignIndicatorModal.set(true);
  }

  assignIndicator(indicatorId: string): void {
    const selected = this.selectedElementForIndicators();
    if (!selected) return;

    const config = this.projectConfig();

    if (selected.type === 'component') {
      const updatedComponents = config.components.map(comp =>
        comp.id === selected.id ? { ...comp, indicators: [...comp.indicators, indicatorId] } : comp
      );

      this.projectConfig.set({
        ...config,
        components: updatedComponents
      });
    } else {
      const updatedSubComponents = config.subComponents.map(sub =>
        sub.id === selected.id ? { ...sub, indicators: [...sub.indicators, indicatorId] } : sub
      );

      this.projectConfig.set({
        ...config,
        subComponents: updatedSubComponents
      });
    }
  }

  removeIndicatorFromElement(elementType: 'component' | 'subcomponent', elementId: string, indicatorId: string): void {
    const config = this.projectConfig();

    if (elementType === 'component') {
      const updatedComponents = config.components.map(comp =>
        comp.id === elementId ? { ...comp, indicators: comp.indicators.filter(id => id !== indicatorId) } : comp
      );

      this.projectConfig.set({
        ...config,
        components: updatedComponents
      });
    } else {
      const updatedSubComponents = config.subComponents.map(sub =>
        sub.id === elementId ? { ...sub, indicators: sub.indicators.filter(id => id !== indicatorId) } : sub
      );

      this.projectConfig.set({
        ...config,
        subComponents: updatedSubComponents
      });
    }
  }

  getIndicatorById(indicatorId: string): ProjectIndicator | undefined {
    return this.projectConfig().indicators.find(ind => ind.id === indicatorId);
  }

  getAvailableIndicatorsForElement(type: 'component' | 'subcomponent', elementId: string): ProjectIndicator[] {
    const config = this.projectConfig();
    const element = type === 'component' ? config.components.find(c => c.id === elementId) : config.subComponents.find(s => s.id === elementId);

    if (!element) return [];

    const level = type === 'component' ? 1 : 2;
    return config.indicators.filter(ind => ind.level === level && ind.isActive && !element.indicators.includes(ind.id));
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
      components: [],
      subComponents: [],
      indicators: []
    });
    this.newComponentForm.set({ name: '', code: '' });
    this.newSubComponentForm.set({ name: '', code: '', parentComponentId: '' });
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

  // Helper method para verificar si un componente tiene sub-componentes
  hasSubComponents(componentId: string): boolean {
    return this.projectConfig().subComponents.some(sub => sub.parentComponentId === componentId);
  }

  // Obtener nombre del elemento para mostrar en UI
  getElementName(type: 'component' | 'subcomponent', elementId: string): string {
    const config = this.projectConfig();
    if (type === 'component') {
      const component = config.components.find(c => c.id === elementId);
      return component?.name || 'this component';
    } else {
      const subComponent = config.subComponents.find(s => s.id === elementId);
      return subComponent?.name || 'this sub-component';
    }
  }

  // Crear indicador directamente para un elemento específico
  createIndicatorForElement(type: 'component' | 'subcomponent', elementId: string): void {
    const level = type === 'component' ? 1 : 2;
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
