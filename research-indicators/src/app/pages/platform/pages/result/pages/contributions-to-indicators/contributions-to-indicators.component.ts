import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormHeaderComponent } from '@shared/components/form-header/form-header.component';
import { NavigationButtonsComponent } from '@shared/components/navigation-buttons/navigation-buttons.component';
import { ApiService } from '../../../../../../shared/services/api.service';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { AllianceAlignmentContract } from '../../../../../../shared/interfaces/get-alliance-alignment.interface';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-contributions-to-indicators',
  imports: [FormHeaderComponent, NavigationButtonsComponent, TabsModule],
  templateUrl: './contributions-to-indicators.component.html',
  styleUrl: './contributions-to-indicators.component.scss'
})
export default class ContributionsToIndicatorsComponent implements OnInit {
  api = inject(ApiService);
  cache = inject(CacheService);
  projects = signal<AllianceAlignmentContract[]>([]);

  ngOnInit() {
    this.getData();
  }

  firstProject = computed(() => this.projects()[0]?.contract_id ?? '');

  saveData = (option?: 'back' | 'next' | 'save') => {
    return option;
  };

  async getData() {
    const response = await this.api.GET_Alignments(this.cache.currentResultId());
    this.projects.set(response.data.contracts);
  }
}
