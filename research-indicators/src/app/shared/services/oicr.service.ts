import { Injectable, WritableSignal } from '@angular/core';
import { PatchOicr } from '@shared/interfaces/oicr-creation.interface';

@Injectable({
  providedIn: 'root'
})
export class OicrService {
  clearOicrSelection(body: WritableSignal<PatchOicr>): void {
    body.update(current => ({
      ...current,
      link_result: []
    }));
  }
  clearOicrSelectionInForm(body: WritableSignal<{ step_one: { link_result: { external_oicr_id: number } } }>): void {
    body.update(current => ({
      ...current,
      step_one: {
        ...current.step_one,
        link_result: { external_oicr_id: 0 }
      }
    }));
  }
}
