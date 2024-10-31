import { TestBed } from '@angular/core/testing';
import { SaveOnWritingDirective } from './save-on-writing.directive';
import { ElementRef } from '@angular/core';
import { ActionsService } from '../services/actions.service';

describe('SaveOnWritingDirective', () => {
  let mockElementRef: ElementRef;
  let mockActionsService: Partial<ActionsService>;

  beforeEach(() => {
    mockElementRef = new ElementRef(document.createElement('input'));
    mockActionsService = {
      saveCurrentSection: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: ElementRef, useValue: mockElementRef },
        { provide: ActionsService, useValue: mockActionsService }
      ]
    });
  });

  it('should create an instance', () => {
    const directive = TestBed.runInInjectionContext(() => new SaveOnWritingDirective(mockElementRef));
    expect(directive).toBeTruthy();
  });
});
