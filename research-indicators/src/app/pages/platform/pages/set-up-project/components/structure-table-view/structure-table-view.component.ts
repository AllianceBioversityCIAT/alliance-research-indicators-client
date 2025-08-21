import { Component, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { SetUpProjectService } from '../../set-up-project.service';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-structure-table-view',
  imports: [TableModule, TagModule, ButtonModule],
  templateUrl: './structure-table-view.component.html',
  styleUrl: './structure-table-view.component.scss'
})
export class StructureTableViewComponent {
  setUpProjectService = inject(SetUpProjectService);
}
