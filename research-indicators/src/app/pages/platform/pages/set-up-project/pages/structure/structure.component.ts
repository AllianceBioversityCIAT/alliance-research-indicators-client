import { Component, signal } from '@angular/core';
import { StructureCardsViewComponent } from '../../components/structure-cards-view/structure-cards-view.component';
import { StructureTableViewComponent } from '../../components/structure-table-view/structure-table-view.component';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-structure',
  imports: [StructureCardsViewComponent, StructureTableViewComponent, ButtonModule, TooltipModule],
  templateUrl: './structure.component.html',
  styleUrl: './structure.component.scss'
})
export default class StructureComponent {
  // Vista predeterminada: tabla (false = tabla, true = tarjetas)
  isCardsView = signal<boolean>(false);

  toggleView() {
    this.isCardsView.update(current => !current);
  }
}
