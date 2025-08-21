import { Component } from '@angular/core';
import { StructureCardsViewComponent } from '../../components/structure-cards-view/structure-cards-view.component';
import { StructureTableViewComponent } from '../../components/structure-table-view/structure-table-view.component';

@Component({
  selector: 'app-structure',
  imports: [StructureCardsViewComponent, StructureTableViewComponent],
  templateUrl: './structure.component.html',
  styleUrl: './structure.component.scss'
})
export default class StructureComponent {}
