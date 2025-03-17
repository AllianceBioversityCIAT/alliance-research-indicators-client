import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EvidenceItemComponent } from './evidence-item.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('EvidenceItemComponent', () => {
  let component: EvidenceItemComponent;
  let fixture: ComponentFixture<EvidenceItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvidenceItemComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(EvidenceItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
