import { Injectable, Signal, computed, effect, inject, signal } from '@angular/core';
import { MainResponse } from '../interfaces/responses.interface';
import { ToPromiseService } from './to-promise.service';
import { ControlListCacheService } from './control-list-cache.service';

export interface SignalEndpoint<T> {
  isLoading: Signal<boolean>;
  hasValue: Signal<boolean>;
  list: Signal<T>;
  fetch: () => Promise<void>;
  promise: () => Promise<T>;
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

    const hasValue = computed(() => {
      const value = data();
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (value && typeof value === 'object') {
        return Object.keys(value).length > 0;
      }
      return false;
    });

    const promise = async () => {
      if (useCache && this.clCache.has(urlFn())) {
        return this.clCache.get(urlFn());
      }
      const { data: responseData } = (await this.TP.get(urlFn(), {})) as MainResponse<T>;
      if (useCache) this.clCache.set(urlFn(), responseData);
      return responseData;
    };

    const fetch = async () => {
      loading.set(true);
      try {
        const responseData = await promise();
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
      isLoading: computed(() => loading()),
      hasValue,
      list: computed(() => data()),
      fetch,
      promise
    };
  }
}
