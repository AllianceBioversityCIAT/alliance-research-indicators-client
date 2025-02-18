import { Injectable, Signal, computed, effect, inject, signal } from '@angular/core';
import { MainResponse } from '../interfaces/responses.interface';
import { ToPromiseService } from './to-promise.service';
import { ControlListCacheService } from './control-list-cache.service';

export interface SignalEndpointValue<T> {
  isLoading: boolean;
  hasValue: boolean;
  list: T;
  fetch: () => Promise<void>;
  promise: () => Promise<T>;
}

@Injectable({
  providedIn: 'root'
})
export class SignalEndpointService {
  private TP = inject(ToPromiseService);
  private clCache = inject(ControlListCacheService);

  createEndpoint<T>(urlFn: () => string, useCache = true) {
    const loading = signal(false);
    const data = signal<T>([] as unknown as T);
    const endpointSignal = signal<SignalEndpointValue<T>>({
      isLoading: false,
      hasValue: false,
      list: [] as unknown as T,
      fetch: () => Promise.resolve(),
      promise: () => Promise.resolve([] as unknown as T)
    });

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
      console.log('get data');
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
        endpointSignal.update(prev => ({
          ...prev,
          list: responseData
        }));
      } finally {
        loading.set(false);
      }
    };

    // Ejecutar fetch automáticamente al crear el endpoint
    effect(
      () => {
        endpointSignal.update(prev => ({
          ...prev,
          isLoading: loading(),
          hasValue: hasValue(),
          fetch,
          promise
        }));
      },
      { allowSignalWrites: true }
    );

    effect(
      () => {
        fetch();
      },
      { allowSignalWrites: true }
    );

    return endpointSignal;
  }
}
