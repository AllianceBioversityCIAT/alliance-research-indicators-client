import { Injectable, WritableSignal, effect, inject, signal } from '@angular/core';
import { MainResponse } from '../interfaces/responses.interface';
import { ToPromiseService } from './to-promise.service';
import { ControlListCacheService } from './control-list-cache.service';

export interface SignalEndpoint<T> {
  isLoading: WritableSignal<boolean>;
  hasValue: WritableSignal<boolean>;
  list: WritableSignal<T>;
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

  createEndpoint<T>(urlFn: () => string, referenceName?: string, useCache = true): SignalEndpoint<T> {
    const loading = signal(false);
    const data = signal<T>([] as unknown as T);
    const currentReferenceName = signal<string | undefined>(referenceName);
    const hasValueSignal = signal(false);

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

        // Actualizar hasValue basado en la respuesta
        const value = responseData;
        hasValueSignal.set(Array.isArray(value) ? value.length > 0 : value && typeof value === 'object' ? Object.keys(value).length > 0 : false);
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
        fetch();
      },
      { allowSignalWrites: true }
    );

    return {
      isLoading: loading,
      hasValue: hasValueSignal,
      list: data,
      fetch,
      promise,
      setReferenceName
    };
  }
}
