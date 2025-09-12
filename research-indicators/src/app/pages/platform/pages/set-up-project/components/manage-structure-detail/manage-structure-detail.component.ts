import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SetUpProjectService } from '../../set-up-project.service';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-manage-structure-detail',
  imports: [DialogModule, ButtonModule, InputTextModule],
  templateUrl: './manage-structure-detail.component.html',
  styleUrl: './manage-structure-detail.component.scss'
})
export class ManageStructureDetailComponent {
  setUpProjectService = inject(SetUpProjectService);
}
