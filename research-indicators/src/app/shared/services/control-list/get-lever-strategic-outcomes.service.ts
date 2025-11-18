import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { LeverStrategicOutcome } from '@shared/interfaces/oicr-creation.interface';

@Injectable({ providedIn: 'root' })
export class GetLeverStrategicOutcomesService {
  private api = inject(ApiService);
  private loadingStore = new Map<number, ReturnType<typeof signal<boolean>>>();
  private listStore = new Map<number, ReturnType<typeof signal<LeverStrategicOutcome[]>>>();
  
  loading = signal(false);
  list = signal<LeverStrategicOutcome[]>([]);
  isOpenSearch(): boolean {
    return false;
  }

  getList(lever_id?: number) {
    if (!lever_id) return this.list;
    if (!this.listStore.has(lever_id)) this.listStore.set(lever_id, signal<LeverStrategicOutcome[]>([]));
    return this.listStore.get(lever_id)!;
  }

  getLoading(lever_id?: number) {
    if (!lever_id) return this.loading;
    if (!this.loadingStore.has(lever_id)) this.loadingStore.set(lever_id, signal<boolean>(false));
    return this.loadingStore.get(lever_id)!;
  }

  async main(lever_id?: number) {
    if (!lever_id) {
      this.loading.set(true);
      try {
        this.list.set([]);
      } finally {
        this.loading.set(false);
      }
      return;
    }
    const loadingSig = this.getLoading(lever_id);
    const listSig = this.getList(lever_id);
    loadingSig.set(true);
    try {
      const res = await this.api.GET_LeverStrategicOutcomes(lever_id);
      listSig.set(Array.isArray(res?.data) ? res.data : []);
    } catch {
      listSig.set([]);
    } finally {
      loadingSig.set(false);
    }
  }
}


