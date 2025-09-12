import { Component, inject, signal } from '@angular/core';
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
  body = signal({ code: '', name: '' });

  saveEditingLevel1 = () => {
    if (!this.body().code) return;
    this.setUpProjectService.structures.update(structures => {
      const structure = structures.find(s => s.id === this.setUpProjectService.structureDetailModal().structure?.id);
      if (structure) {
        structure.name = this.body().name;
        structure.code = this.body().code;
      }
      return [...structures];
    });
    this.setUpProjectService.saveStructures();
    this.body.set({ code: '', name: '' });
    this.setUpProjectService.structureDetailModal.set({ show: false });
  };

  saveEditingLevel2 = () => {
    if (!this.body().name || !this.body().code) return;
    this.setUpProjectService.structures.update(structures => {
      const item = structures
        .find(s => s.id === this.setUpProjectService.structureDetailModal().structure?.parent_id)
        ?.items?.find(i => i.id === this.setUpProjectService.structureDetailModal().structure?.id);

      if (item) {
        item.name = this.body().name;
        item.code = this.body().code;
      }
      return [...structures];
    });

    this.setUpProjectService.saveStructures();
    this.body.set({ name: '', code: '' });
    this.setUpProjectService.structureDetailModal.set({ show: false });
  };
}
