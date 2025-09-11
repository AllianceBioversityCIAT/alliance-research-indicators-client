import { Component, inject } from '@angular/core';
import { StructureTableViewComponent } from '../../components/structure-table-view/structure-table-view.component';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { SetUpProjectService } from '../../set-up-project.service';
import { DriverjsService } from '@shared/services/driverjs.service';
import { ManageLevelsModalComponent } from '../../components/manage-levels-modal/manage-levels-modal.component';

@Component({
  selector: 'app-structure',
  imports: [StructureTableViewComponent, ButtonModule, TooltipModule, ManageLevelsModalComponent],
  templateUrl: './structure.component.html',
  styleUrl: './structure.component.scss'
})
export default class StructureComponent {
  setUpProjectService = inject(SetUpProjectService);
  driverjs = inject(DriverjsService);
  // Vista predeterminada: tabla (false = tabla, true = tarjetas)

  addStructure = () => {
    this.setUpProjectService.structures.update(structures => {
      structures.push({ id: null, name: '', code: '', items: [], indicators: [], custom_values: [], editing: true, newStructure: true });
      return [...structures];
    });
    this.setUpProjectService.editingFocus.set(true);

    this.setUpProjectService.collapseAllStructures();
    setTimeout(() => {
      this.driverjs.nextStep();
    }, 100);
  };
}
