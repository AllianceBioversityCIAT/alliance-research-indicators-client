import { Component, inject, OnInit, signal } from '@angular/core';
import { FormHeaderComponent } from '@shared/components/form-header/form-header.component';
import { NavigationButtonsComponent } from '@shared/components/navigation-buttons/navigation-buttons.component';
import { ApiService } from '../../../../../../shared/services/api.service';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { AllianceAlignmentContract } from '../../../../../../shared/interfaces/get-alliance-alignment.interface';
import { TabsModule } from 'primeng/tabs';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { Indicator } from '../../../../../../shared/interfaces/get-structures.interface';
import { ProjectIndicatorContract } from '../../../../../../shared/interfaces/get-project-indicators.interface';
import { TooltipModule } from 'primeng/tooltip';
import { MultiselectComponent } from '../../../../../../shared/components/custom-fields/multiselect/multiselect.component';
import { GetProjectIndicatorsHierarchyService } from '../../../../../../shared/services/control-list/get-project-indicators-hierarchy.service';
import { InputComponent } from '../../../../../../shared/components/custom-fields/input/input.component';

@Component({
  selector: 'app-contributions-to-indicators',
  imports: [
    FormHeaderComponent,
    NavigationButtonsComponent,
    TabsModule,
    MultiSelectModule,
    FormsModule,
    TooltipModule,
    MultiselectComponent,
    InputComponent
  ],
  templateUrl: './contributions-to-indicators.component.html',
  styleUrl: './contributions-to-indicators.component.scss'
})
export default class ContributionsToIndicatorsComponent implements OnInit {
  api = inject(ApiService);
  cache = inject(CacheService);
  projects = signal<ProjectIndicatorContract[]>([]);
  currentIndicators = signal<Indicator[]>([]);
  body = signal<{ selectedIndicators: any[] }>({
    selectedIndicators: []
  });
  getProjectIndicatorsHierarchy = inject(GetProjectIndicatorsHierarchyService);

  ngOnInit() {
    this.getData();
  }

  currentProject = signal<ProjectIndicatorContract | null>(null);

  saveData = (option?: 'back' | 'next' | 'save') => {
    return option;
  };

  onProjectChange(event: ProjectIndicatorContract) {
    this.currentProject.set(event);
    this.getIndicators();
  }

  async getData() {
    const response = await this.api.GET_IndicatorsByResult(this.cache.currentMetadata().result_id?.toString() || '');
    console.log(response.data);
    console.log(response.data.contracts);
    this.projects.set(response.data.contracts ?? []);
    if (this.projects().length) {
      this.currentProject.set(this.projects()[0]);
      this.getIndicators();
    }
  }

  async getIndicators() {
    console.log(this.currentProject()?.agreement_id);
    this.body.set({ selectedIndicators: [] });
    this.getProjectIndicatorsHierarchy.update(this.currentProject()?.agreement_id ?? '');
    // this.currentIndicators.set(this.getProjectIndicatorsHierarchy.list());
  }
}
