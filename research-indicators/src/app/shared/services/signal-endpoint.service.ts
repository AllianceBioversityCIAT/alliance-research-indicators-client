import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { MainResponse } from '../interfaces/responses.interface';
import { ToPromiseService } from './to-promise.service';
import { ControlListCacheService } from './control-list-cache.service';

export interface SignalEndpointValue<T> {
  isLoading: boolean;
  hasValue: boolean;
  list: T;
  fetch: () => Promise<void>;
  promise: () => Promise<T>;
  setReferenceName: (name: string) => void;
}

@Injectable({
  providedIn: 'root'
})
export class SignalEndpointService {
  private TP = inject(ToPromiseService);
  private clCache = inject(ControlListCacheService);

  createEndpoint<T>(urlFn: () => string, referenceName?: string, useCache = true) {
    const loading = signal(false);
    const data = signal<T>([] as unknown as T);
    const currentReferenceName = signal<string | undefined>(referenceName);

    const endpointSignal = signal<SignalEndpointValue<T>>({
      isLoading: false,
      hasValue: false,
      list: [] as unknown as T,
      fetch: () => Promise.resolve(),
      promise: () => Promise.resolve([] as unknown as T),
      setReferenceName: (name: string) => name // placeholder
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

    const getCacheKey = () => {
      const ref = currentReferenceName();
      return ref ? `${urlFn()}_${ref}` : urlFn();
    };

    const promise = async () => {
      if (useCache && this.clCache.has(getCacheKey())) {
        return this.clCache.get(getCacheKey());
      }
      const { data: responseData } = (await this.TP.get(urlFn(), {})) as MainResponse<T>;
      if (useCache) this.clCache.set(getCacheKey(), responseData);
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

    const setReferenceName = (name: string) => {
      currentReferenceName.set(name);
      fetch();
    };

    // Ejecutar fetch automáticamente al crear el endpoint
    effect(
      () => {
        endpointSignal.update(prev => ({
          ...prev,
          isLoading: loading(),
          hasValue: hasValue(),
          fetch,
          promise,
          setReferenceName
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
