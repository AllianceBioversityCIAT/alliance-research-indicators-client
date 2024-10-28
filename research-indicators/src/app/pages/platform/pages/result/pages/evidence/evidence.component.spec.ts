import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvidenceComponent } from './evidence.component';

describe('EvidenceComponent', () => {
  let component: EvidenceComponent;
  let fixture: ComponentFixture<EvidenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvidenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvidenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
