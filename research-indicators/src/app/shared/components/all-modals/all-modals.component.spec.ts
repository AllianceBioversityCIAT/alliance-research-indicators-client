import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AllModalsComponent } from './all-modals.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { SubmissionService } from '@shared/services/submission.service';

describe('AllModalsComponent', () => {
  let component: AllModalsComponent;
  let fixture: ComponentFixture<AllModalsComponent>;

  beforeEach(async () => {
    const mockSubmissionService = {
      statusSelected: signal({
        key: 'submitted',
        label: 'Submitted',
        description: 'The result has been submitted',
        icon: 'pi pi-check',
        color: 'success',
        message: 'The result was submitted successfully.',
        statusId: 1,
        selected: true
      }),
      comment: signal('')
    };
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AllModalsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: new Map() },
            params: of({}) // Mock route parameters if needed
          }
        },
        {
          provide: SubmissionService,
          useValue: mockSubmissionService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AllModalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
