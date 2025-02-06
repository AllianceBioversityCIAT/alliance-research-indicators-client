import { Component, inject } from '@angular/core';
import { ProjectItemComponent } from '../../../../shared/components/project-item/project-item.component';
import { ApiService } from '@shared/services/api.service';
import { FilterByTextWithAttrPipe } from '../../../../shared/pipes/filter-by-text-with-attr.pipe';
import { FormsModule } from '@angular/forms';
import { CustomProgressBarComponent } from '@shared/components/custom-progress-bar/custom-progress-bar.component';
import { GetContractsByUserService } from '@shared/services/control-list/get-contracts-by-user.service';

@Component({
  selector: 'app-my-projects',
  standalone: true,
  imports: [ProjectItemComponent, FilterByTextWithAttrPipe, FormsModule, CustomProgressBarComponent],
  templateUrl: './my-projects.component.html',
  styleUrl: './my-projects.component.scss'
})
export default class MyProjectsComponent {
  api = inject(ApiService);
  getContractsByUserService = inject(GetContractsByUserService);
  searchValue = '';
}
