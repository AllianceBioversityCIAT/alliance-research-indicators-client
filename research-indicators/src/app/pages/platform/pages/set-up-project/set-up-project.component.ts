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

  defaultLevel1Indicators = computed(() => this.defaultIndicators().filter(ind => ind.level === 1));
  defaultLevel2Indicators = computed(() => this.defaultIndicators().filter(ind => ind.level === 2));
}
