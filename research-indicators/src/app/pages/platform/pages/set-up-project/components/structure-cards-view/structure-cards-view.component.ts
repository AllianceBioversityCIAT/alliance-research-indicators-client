import { Component, inject, signal } from '@angular/core';
import { UpdateItemComponent } from '../update-item/update-item.component';
import { CreateStructureComponent } from '../create-structure/create-structure.component';
import { UpdateStructureComponent } from '../update-structure/update-structure.component';
import { CreateItemComponent } from '../create-item/create-item.component';
import { SetUpProjectService } from '../../set-up-project.service';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-structure-cards-view',
  imports: [CreateStructureComponent, UpdateStructureComponent, CreateItemComponent, UpdateItemComponent, ButtonModule, TabsModule, TooltipModule],
  templateUrl: './structure-cards-view.component.html',
  styleUrl: './structure-cards-view.component.scss'
})
export class StructureCardsViewComponent {
  setUpProjectService = inject(SetUpProjectService);
  selectedStructureIndex = signal<number>(0);
}
