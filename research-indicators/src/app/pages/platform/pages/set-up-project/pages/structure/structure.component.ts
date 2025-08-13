import { Component, inject, signal } from '@angular/core';
import { UpdateStructureComponent } from '../../components/update-structure/update-structure.component';
import { CreateStructureComponent } from '../../components/create-structure/create-structure.component';
import { ButtonModule } from 'primeng/button';
import { SetUpProjectService } from '../../set-up-project.service';
import { CreateItemComponent } from '../../components/create-item/create-item.component';
import { UpdateItemComponent } from '../../components/update-item/update-item.component';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-structure',
  imports: [CreateStructureComponent, UpdateStructureComponent, CreateItemComponent, UpdateItemComponent, ButtonModule, TabsModule, TooltipModule],
  templateUrl: './structure.component.html',
  styleUrl: './structure.component.scss'
})
export default class StructureComponent {
  setUpProjectService = inject(SetUpProjectService);
  selectedStructureIndex = signal<number>(0);
}
