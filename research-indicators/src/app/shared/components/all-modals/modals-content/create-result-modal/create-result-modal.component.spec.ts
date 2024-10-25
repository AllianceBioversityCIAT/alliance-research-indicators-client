import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateResultModalComponent } from './create-result-modal.component';

describe('CreateResultModalComponent', () => {
  let component: CreateResultModalComponent;
  let fixture: ComponentFixture<CreateResultModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateResultModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateResultModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
