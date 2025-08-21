import { Component, inject, OnInit, signal } from '@angular/core';
import { FormHeaderComponent } from '@shared/components/form-header/form-header.component';
import { NavigationButtonsComponent } from '@shared/components/navigation-buttons/navigation-buttons.component';
import { ApiService } from '../../../../../../shared/services/api.service';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { TabsModule } from 'primeng/tabs';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { Indicator } from '../../../../../../shared/interfaces/get-structures.interface';
import { ProjectIndicatorContract } from '../../../../../../shared/interfaces/get-project-indicators.interface';
import { TooltipModule } from 'primeng/tooltip';
import { MultiselectComponent } from '../../../../../../shared/components/custom-fields/multiselect/multiselect.component';
import { GetProjectIndicatorsHierarchyService } from '../../../../../../shared/services/control-list/get-project-indicators-hierarchy.service';
import { InputComponent } from '../../../../../../shared/components/custom-fields/input/input.component';
import { PostSyncContributor } from '../../../../../../shared/interfaces/post-sync-contributor.interface';
import { InputNumberModule } from 'primeng/inputnumber';
import { ActionsService } from '../../../../../../shared/services/actions.service';

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
    InputComponent,
    InputNumberModule
  ],
  templateUrl: './contributions-to-indicators.component.html',
  styleUrl: './contributions-to-indicators.component.scss'
})
export default class ContributionsToIndicatorsComponent implements OnInit {
  actions = inject(ActionsService);
  loading = signal(false);
  api = inject(ApiService);
  cache = inject(CacheService);
  projects = signal<ProjectIndicatorContract[]>([]);
  currentIndicators = signal<Indicator[]>([]);
  body = signal<{ selectedIndicators: PostSyncContributor[] }>({
    selectedIndicators: []
  });
  getProjectIndicatorsHierarchy = inject(GetProjectIndicatorsHierarchyService);

  ngOnInit() {
    this.getData();
  }

  currentProject = signal<ProjectIndicatorContract | null>(null);

  saveData = async (option?: 'back' | 'next' | 'save') => {
    const selectedIndicators = this.body().selectedIndicators.map(item => {
      const obj = {
        result_id: this.cache.currentMetadata().result_id,
        indicator_id: item.id,
        contribution_value: item.contribution_value,
        contribution_id: item.contribution_id
      };

      return obj;
    });
    await this.api.POST_SyncContribution(selectedIndicators as PostSyncContributor[]);
    this.actions.showToast({ severity: 'success', summary: 'Success', detail: 'Contributions saved successfully' });

    return option;
  };

  async onProjectChange(event: ProjectIndicatorContract) {
    this.currentProject.set(event);
    await this.getIndicators();
    await this.getContributions();
  }

  async getData() {
    const response = await this.api.GET_IndicatorsByResult(this.cache.currentMetadata().result_id?.toString() || '');
    this.projects.set(response.data.contracts ?? []);
    if (this.projects().length) {
      this.currentProject.set(this.projects()[0]);
      await this.getIndicators();
    }
    await this.getContributions();
  }

  async getIndicators() {
    this.body.set({ selectedIndicators: [] });
    this.getProjectIndicatorsHierarchy.update(this.currentProject()?.agreement_id ?? '');
  }

  async getContributions() {
    this.loading.set(true);
    this.body.set({ selectedIndicators: [] });
    const response = await this.api.GET_ContributionsByResult();
    this.body.set({
      selectedIndicators: response.data.map((item: PostSyncContributor) => ({
        ...item,
        id: item.indicator_id
      }))
    });
    this.loading.set(false);
  }
}
