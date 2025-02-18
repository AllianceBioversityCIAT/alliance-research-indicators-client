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
    const hasValueSignal = signal(false);
    const currentReferenceName = signal<string | undefined>(referenceName);

    const getParentCacheKey = () => urlFn();
    const getReferenceCacheKey = (reference: string) => `${urlFn()}_${reference}`;

    const fetchFromAPI = async () => {
      const { data: responseData } = (await this.TP.get(urlFn(), {})) as MainResponse<T>;
      if (useCache) {
        // Guardar en caché padre
        console.log(this.clCache.getAll());
        this.clCache.set(getParentCacheKey(), responseData);
        // Si hay referencia, guardar también en su caché
        const reference = currentReferenceName();
        if (reference) {
          this.clCache.set(getReferenceCacheKey(reference), responseData);
        }
      }
      return responseData;
    };

    const getCachedData = () => {
      if (!useCache) return null;

      const reference = currentReferenceName();
      if (reference) {
        const referenceCacheKey = getReferenceCacheKey(reference);
        if (this.clCache.has(referenceCacheKey)) {
          return this.clCache.get(referenceCacheKey);
        }
      }

      const parentCacheKey = getParentCacheKey();
      return this.clCache.has(parentCacheKey) ? this.clCache.get(parentCacheKey) : null;
    };

    const promise = async () => {
      const cachedData = getCachedData();
      // console.log("first")
      if (cachedData) return cachedData;
      console.log('reference: ', currentReferenceName());
      console.log(cachedData);
      console.log('consumir api: ', urlFn());
      return fetchFromAPI();
    };

    const updateHasValue = (value: T) => {
      hasValueSignal.set(Array.isArray(value) ? value.length > 0 : value && typeof value === 'object' ? Object.keys(value).length > 0 : false);
    };

    const fetch = async () => {
      loading.set(true);
      try {
        const responseData = await promise();
        data.set(responseData);
        updateHasValue(responseData);
      } finally {
        loading.set(false);
      }
    };

    const setReferenceName = (name: string) => {
      currentReferenceName.set(name);
      fetch();
    };

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
