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

@Component({
  selector: 'app-contributions-to-indicators',
  imports: [FormHeaderComponent, NavigationButtonsComponent, TabsModule, MultiSelectModule, FormsModule, TooltipModule],
  templateUrl: './contributions-to-indicators.component.html',
  styleUrl: './contributions-to-indicators.component.scss'
})
export default class ContributionsToIndicatorsComponent implements OnInit {
  api = inject(ApiService);
  cache = inject(CacheService);
  projects = signal<ProjectIndicatorContract[]>([]);
  currentIndicators = signal<Indicator[]>([]);
  selectedProjects = signal<AllianceAlignmentContract[]>([]);

  ngOnInit() {
    this.getData();
  }

  currentProject = signal<ProjectIndicatorContract | null>(null);

  saveData = (option?: 'back' | 'next' | 'save') => {
    return option;
  };

  onProjectChange(event: ProjectIndicatorContract) {
    this.currentProject.set(event);
    this.selectedProjects.set([]);
    this.getIndicators();
  }

  async getData() {
    const response = await this.api.GET_IndicatorsByResult(this.cache.currentMetadata().result_id?.toString() || '');
    console.log(response.data.contracts);
    this.projects.set(response.data.contracts ?? []);
    if (this.projects().length) {
      this.currentProject.set(this.projects()[0]);
      this.getIndicators();
    }
  }

  async getIndicators() {
    console.log(this.currentProject()?.agreement_id);
    const response = await this.api.GET_Hierarchy(this.currentProject()?.agreement_id ?? '');
    console.log(response.data);
    this.currentIndicators.set(response.data);
  }
}
