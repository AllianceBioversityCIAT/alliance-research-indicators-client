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

@Component({
  selector: 'app-contributions-to-indicators',
  imports: [FormHeaderComponent, NavigationButtonsComponent, TabsModule, MultiSelectModule, FormsModule],
  templateUrl: './contributions-to-indicators.component.html',
  styleUrl: './contributions-to-indicators.component.scss'
})
export default class ContributionsToIndicatorsComponent implements OnInit {
  api = inject(ApiService);
  cache = inject(CacheService);
  projects = signal<AllianceAlignmentContract[]>([]);
  currentIndicators = signal<Indicator[]>([]);
  selectedProjects = signal<AllianceAlignmentContract[]>([]);

  ngOnInit() {
    this.getData();
  }

  currentProject = signal<AllianceAlignmentContract | null>(null);

  saveData = (option?: 'back' | 'next' | 'save') => {
    return option;
  };

  onProjectChange(event: any) {
    console.log(event);
  }

  async getData() {
    const response = await this.api.GET_Alignments(this.cache.currentResultId());
    this.projects.set(response.data.contracts);
    if (this.projects().length) {
      this.currentProject.set(this.projects()[0]);
      this.getIndicators();
    }
  }

  async getIndicators() {
    const response = await this.api.GET_Indicators(this.currentProject()?.contract_id ?? '');
    this.currentIndicators.set(response.data);
  }
}
