import { Component, inject, signal } from '@angular/core';
import { ProjectItemComponent } from '../../../../shared/components/project-item/project-item.component';
import { ApiService } from '@shared/services/api.service';
import { FilterByTextWithAttrPipe } from '../../../../shared/pipes/filter-by-text-with-attr.pipe';
import { FormsModule } from '@angular/forms';
import { CustomProgressBarComponent } from '@shared/components/custom-progress-bar/custom-progress-bar.component';
import { GetContractsByUserService } from '@shared/services/control-list/get-contracts-by-user.service';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-my-projects',
  imports: [ProjectItemComponent, SlicePipe, FilterByTextWithAttrPipe, FormsModule, CustomProgressBarComponent, PaginatorModule],
  templateUrl: './my-projects.component.html',
  styleUrl: './my-projects.component.scss'
})
export default class MyProjectsComponent {
  api = inject(ApiService);
  getContractsByUserService = inject(GetContractsByUserService);
  searchValue = '';
  first = signal(0);
  rows = signal(5);

  onPageChange(event: PaginatorState) {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 5);
  }
}
