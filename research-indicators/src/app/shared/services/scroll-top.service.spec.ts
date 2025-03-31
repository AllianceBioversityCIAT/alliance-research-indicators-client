import { TestBed } from '@angular/core/testing';
import { ScrollToTopService } from './scroll-top.service';

describe('ScrollToTopService', () => {
  let service: ScrollToTopService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScrollToTopService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should scroll to top if element exists', () => {
    const scrollSpy = jasmine.createSpy('scrollTo');
    const fakeElement = { scrollTo: scrollSpy } as any;

    spyOn(document, 'getElementById').and.returnValue(fakeElement);

    service.scrollContentToTop('content');

    expect(document.getElementById).toHaveBeenCalledWith('content');
    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('should warn if element does not exist', () => {
    spyOn(document, 'getElementById').and.returnValue(null);
    const warnSpy = spyOn(console, 'warn');

    service.scrollContentToTop('nonexistent');

    expect(warnSpy).toHaveBeenCalledWith('Element with id "nonexistent" not found');
  });
});