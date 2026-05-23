import { TestBed } from '@angular/core/testing';
import { HloSelectionModalContextService } from './hlo-selection-modal-context.service';

describe('HloSelectionModalContextService', () => {
  let service: HloSelectionModalContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [HloSelectionModalContextService] });
    service = TestBed.inject(HloSelectionModalContextService);
  });

  it('default context is null', () => {
    expect(service.context()).toBeNull();
  });

  it('setContext updates the signal with the provided payload', () => {
    service.setContext({ resultCode: '19792' });
    expect(service.context()).toEqual({ resultCode: '19792' });
  });

  it('setContext can be called repeatedly; latest payload wins', () => {
    service.setContext({ resultCode: '19792' });
    service.setContext({ resultCode: 'STAR-19792' });
    expect(service.context()).toEqual({ resultCode: 'STAR-19792' });
  });

  it('clear() resets the signal to null', () => {
    service.setContext({ resultCode: '19792' });
    service.clear();
    expect(service.context()).toBeNull();
  });

  it('providedIn root — TestBed.inject returns the same instance across calls', () => {
    const a = TestBed.inject(HloSelectionModalContextService);
    const b = TestBed.inject(HloSelectionModalContextService);
    expect(a).toBe(b);
  });
});
