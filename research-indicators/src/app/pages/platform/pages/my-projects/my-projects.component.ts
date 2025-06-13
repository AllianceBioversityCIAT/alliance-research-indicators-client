import { Component, computed, inject, signal } from '@angular/core';
import { ProjectItemComponent } from '../../../../shared/components/project-item/project-item.component';
import { ApiService } from '@shared/services/api.service';
import { FormsModule } from '@angular/forms';
import { CustomProgressBarComponent } from '@shared/components/custom-progress-bar/custom-progress-bar.component';
import { GetContractsByUserService } from '@shared/services/control-list/get-contracts-by-user.service';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-my-projects',
  imports: [ProjectItemComponent, SlicePipe, FormsModule, CustomProgressBarComponent, PaginatorModule],
  templateUrl: './my-projects.component.html',
  styleUrl: './my-projects.component.scss'
})
export default class MyProjectsComponent {
  api = inject(ApiService);
  getContractsByUserService = inject(GetContractsByUserService);
  first = signal(0);
  rows = signal(5);
  private readonly _searchValue = signal('');

  get searchValue(): string {
    return this._searchValue();
  }

  set searchValue(value: string) {
    this._searchValue.set(value);
    this.first.set(0); // Reset to first page when filtering
  }

  filteredProjects = computed(() => {
    return this.getContractsByUserService.list().filter(project => project.full_name?.toLowerCase().includes(this._searchValue().toLowerCase()));
  });

  onPageChange(event: PaginatorState) {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 5);
  }
}
