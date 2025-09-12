import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SetUpProjectService } from '../../set-up-project.service';
import { FormsModule } from '@angular/forms';
import { InputComponent } from '../../../../../../shared/components/custom-fields/input/input.component';

@Component({
  selector: 'app-manage-structure-detail',
  imports: [DialogModule, ButtonModule, InputComponent, FormsModule],
  templateUrl: './manage-structure-detail.component.html',
  styleUrl: './manage-structure-detail.component.scss'
})
export class ManageStructureDetailComponent {
  setUpProjectService = inject(SetUpProjectService);
  body = this.setUpProjectService.structureDetailBody;
  saveStructure = () => {
    const structure = this.setUpProjectService.structureDetailModal().structure;
    if (!structure) return;

    if (structure.isParent) {
      // Logic for level 1 (parent)
      if (!this.body().code) return;
      this.setUpProjectService.structures.update(structures => {
        const foundStructure = structures.find(s => s.id === structure.id);
        if (foundStructure) {
          foundStructure.name = this.body().name;
          foundStructure.code = this.body().code;
        }
        return [...structures];
      });
    } else {
      // Logic for level 2 (child)
      if (!this.body().name || !this.body().code) return;
      this.setUpProjectService.structures.update(structures => {
        const item = structures.find(s => s.id === structure.parent_id)?.items?.find(i => i.id === structure.id);

        if (item) {
          item.name = this.body().name;
          item.code = this.body().code;
        }
        return [...structures];
      });
    }

    this.setUpProjectService.saveStructures();
    this.body.set({ code: '', name: '' });
    this.setUpProjectService.structureDetailModal.set({ show: false });
  };
}
