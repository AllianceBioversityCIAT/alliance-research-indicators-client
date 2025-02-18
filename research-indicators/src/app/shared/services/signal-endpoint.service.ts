import { Injectable, Signal, computed, effect, inject, signal } from '@angular/core';
import { MainResponse } from '../interfaces/responses.interface';
import { ToPromiseService } from './to-promise.service';
import { ControlListCacheService } from './control-list-cache.service';

export interface SignalEndpoint<T> {
  loading: Signal<boolean>;
  list: Signal<T>;
  fetch: () => Promise<void>;
}

@Injectable({
  providedIn: 'root'
})
export class SignalEndpointService {
  private TP = inject(ToPromiseService);
  private clCache = inject(ControlListCacheService);

  createEndpoint<T>(urlFn: () => string, useCache = true): SignalEndpoint<T> {
    const loading = signal(false);
    const data = signal<T>([] as unknown as T);

    const fetch = async () => {
      if (useCache && this.clCache.has(urlFn())) {
        data.set(this.clCache.get(urlFn()));
        return;
      }

      loading.set(true);
      try {
        const { data: responseData } = (await this.TP.get(urlFn(), {})) as MainResponse<T>;
        if (useCache) this.clCache.set(urlFn(), responseData);
        data.set(responseData);
      } finally {
        loading.set(false);
      }
    };

    // Ejecutar fetch automáticamente al crear el endpoint
    effect(
      () => {
        fetch();
      },
      { allowSignalWrites: true }
    );

    return {
      loading: computed(() => loading()),
      list: computed(() => data()),
      fetch
    };
  }
}
