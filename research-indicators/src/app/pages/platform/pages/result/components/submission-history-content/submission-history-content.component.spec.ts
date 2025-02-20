import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionHistoryContentComponent } from './submission-history-content.component';

describe('SubmissionHistoryContentComponent', () => {
  let component: SubmissionHistoryContentComponent;
  let fixture: ComponentFixture<SubmissionHistoryContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmissionHistoryContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmissionHistoryContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
