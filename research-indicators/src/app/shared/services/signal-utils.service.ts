/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SignalUtilsService {
  updateSignalByKey(signal: WritableSignal<Record<string, unknown>>, key: string, value: unknown) {
    signal.update(prev => ({ ...prev, [key]: value }));
  }

  updateSignalByEvent(signal: WritableSignal<any>, key: string, event: Event) {
    const target = event.target as HTMLInputElement;
    this.updateSignalByKey(signal, key, target.value);
  }

  pushToSignal(signal: WritableSignal<any>, value: any) {
    signal.update(prev => [...prev, value]);
  }
}
