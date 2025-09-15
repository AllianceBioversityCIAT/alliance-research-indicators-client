import { Component, inject } from '@angular/core';
import { StructureTableViewComponent } from '../../components/structure-table-view/structure-table-view.component';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { SetUpProjectService } from '../../set-up-project.service';
import { DriverjsService } from '@shared/services/driverjs.service';
import { ManageLevelsModalComponent } from '../../components/manage-levels-modal/manage-levels-modal.component';
import { ManageStructureDetailComponent } from '../../components/manage-structure-detail/manage-structure-detail.component';

@Component({
  selector: 'app-structure',
  imports: [StructureTableViewComponent, ButtonModule, TooltipModule, ManageLevelsModalComponent, ManageStructureDetailComponent],
  templateUrl: './structure.component.html',
  styleUrl: './structure.component.scss'
})
export default class StructureComponent {
  setUpProjectService = inject(SetUpProjectService);
  driverjs = inject(DriverjsService);
  // Vista predeterminada: tabla (false = tabla, true = tarjetas)
}
