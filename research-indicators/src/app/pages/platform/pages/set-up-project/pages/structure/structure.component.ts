import { Component, inject } from '@angular/core';
import { StructureCardsViewComponent } from '../../components/structure-cards-view/structure-cards-view.component';
import { StructureTableViewComponent } from '../../components/structure-table-view/structure-table-view.component';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { SetUpProjectService } from '../../set-up-project.service';

@Component({
  selector: 'app-structure',
  imports: [StructureCardsViewComponent, StructureTableViewComponent, ButtonModule, TooltipModule],
  templateUrl: './structure.component.html',
  styleUrl: './structure.component.scss'
})
export default class StructureComponent {
  setUpProjectService = inject(SetUpProjectService);

  // Vista predeterminada: tabla (false = tabla, true = tarjetas)

  toggleView() {
    this.setUpProjectService.isCardsView.update(current => !current);
  }
  addStructure = () => {
    this.setUpProjectService.structures.update(structures => {
      structures.push({ id: 's', name: '', code: '', items: [], indicators: [], editing: true, newStructure: true });
      return [...structures];
    });
    this.setUpProjectService.editingFocus.set(true);
  };
}
