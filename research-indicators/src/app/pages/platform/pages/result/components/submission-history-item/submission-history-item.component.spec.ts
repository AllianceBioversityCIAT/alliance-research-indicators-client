import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionHistoryItemComponent } from './submission-history-item.component';

describe('SubmissionHistoryItemComponent', () => {
  let component: SubmissionHistoryItemComponent;
  let fixture: ComponentFixture<SubmissionHistoryItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmissionHistoryItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmissionHistoryItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
