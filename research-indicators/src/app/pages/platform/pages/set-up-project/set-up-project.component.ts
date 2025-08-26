import { Component, OnInit, computed, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
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
import { MenuModule } from 'primeng/menu';
import {
  ProjectIndicator,
  NewIndicatorForm,
  NUMBER_TYPE_OPTIONS,
  NUMBER_FORMAT_OPTIONS,
  AVAILABLE_YEARS
} from '../../../../shared/interfaces/project-setup.interface';
import { SetUpProjectService } from './set-up-project.service';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { AssignIndicatorsModalComponent } from './components/assign-indicators-modal/assign-indicators-modal.component';
import { ActionsService } from '../../../../shared/services/actions.service';
import { Subscription } from 'rxjs';
import { ManageIndicatorModalComponent } from './components/manage-indicator-modal/manage-indicator-modal.component';
import { ProjectItemComponent } from '../../../../shared/components/project-item/project-item.component';
import { GetProjectDetail, GetProjectDetailIndicator } from '../../../../shared/interfaces/get-project-detail.interface';
import { ApiService } from '../../../../shared/services/api.service';
import { DriverjsService } from '@shared/services/driverjs.service';

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
    TextareaModule,
    SelectButtonModule,
    RouterOutlet,
    AssignIndicatorsModalComponent,
    ManageIndicatorModalComponent,
    ProjectItemComponent,
    MenuModule
  ],
  templateUrl: './set-up-project.component.html',
  styleUrl: './set-up-project.component.scss'
})
export default class SetUpProjectComponent implements OnInit, OnDestroy {
  // Configuración principal del proyecto con indicadores por defecto
  driverjs = inject(DriverjsService);
  setUpProjectService = inject(SetUpProjectService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  actions = inject(ActionsService);
  private routeSubscription?: Subscription;
  currentProject = signal<GetProjectDetail>({});
  api = inject(ApiService);
  routeOptions = [
    { label: 'Structures', value: 'structure' },
    { label: 'Indicators', value: 'indicators' }
  ];
  activeRoute: 'structure' | 'indicators' = 'structure';

  ngOnInit(): void {
    const firstChildPath = this.activatedRoute.firstChild?.snapshot.routeConfig?.path;
    this.setUpProjectService.routeid.set(this.activatedRoute.snapshot.params['id']);
    this.setUpProjectService.currentAgreementId.set(this.activatedRoute.snapshot.params['id']);

    // Load hierarchy names from localStorage for current project

    // Subscribe to route parameter changes
    this.routeSubscription = this.activatedRoute.params.subscribe(params => {
      const newRouteId = params['id'];
      if (newRouteId && newRouteId !== this.setUpProjectService.routeid()) {
        this.onRouteIdChange(newRouteId);
      }
    });

    if (firstChildPath === 'indicators') {
      this.activeRoute = 'indicators';
    } else {
      this.activeRoute = 'structure';
    }
    this.setUpProjectService.getStructures();
    this.setUpProjectService.getIndicators();
    this.getProjectDetail();
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  async getProjectDetail() {
    const response = await this.api.GET_ResultsCount(this.setUpProjectService.routeid() as string);
    if (response?.data?.indicators?.length) {
      response.data.indicators.forEach((indicator: GetProjectDetailIndicator) => {
        indicator.full_name = indicator.indicator.name;
      });
      this.currentProject.set(response.data);
    } else if (response?.data) {
      this.currentProject.set(response.data);
    } else {
      this.currentProject.set(undefined as unknown as GetProjectDetail);
    }
  }

  // Indicadores predefinidos disponibles para seleccionar
  defaultIndicators = signal<ProjectIndicator[]>([]);

  // Formularios para nuevos elementos

  newIndicatorForm = signal<NewIndicatorForm>({
    name: '',
    description: '',
    level: null,
    numberType: null,
    numberFormat: null,
    years: [],
    targetUnit: '',
    targetValue: null,
    baseline: null,
    agreement_id: this.setUpProjectService.routeid() as unknown as number
  });

  // Estados de UI

  selectedElementForIndicators = signal<{ type: 'structure' | 'item'; id: string } | null>(null);

  // Opciones disponibles
  numberTypeOptions = NUMBER_TYPE_OPTIONS;
  numberFormatOptions = NUMBER_FORMAT_OPTIONS;
  availableYears = AVAILABLE_YEARS.map(year => ({ label: year.toString(), value: year }));

  isProjectValid = computed(() => {
    return this.setUpProjectService.structures().length > 0 && this.setUpProjectService.structures().some(s => s.items && s.items.length);
  });

  totalItems = computed(() => {
    const config = this.setUpProjectService.structures();
    return config.reduce((acc, s) => acc + (s.items?.length || 0), 0);
  });

  defaultLevel1Indicators = computed(() => this.defaultIndicators().filter(ind => ind.level === 1));
  defaultLevel2Indicators = computed(() => this.defaultIndicators().filter(ind => ind.level === 2));

  onRouteChange(value: 'structure' | 'indicators') {
    this.router.navigate([value], { relativeTo: this.activatedRoute });
  }

  // Method to handle route parameter changes
  onRouteIdChange(newRouteId: string) {
    this.setUpProjectService.routeid.set(newRouteId);
    this.setUpProjectService.currentAgreementId.set(newRouteId);
  }
}
