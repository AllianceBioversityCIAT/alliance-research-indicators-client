import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RequestPartnerModalComponent } from './request-partner-modal.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('RequestPartnerModalComponent', () => {
  let component: RequestPartnerModalComponent;
  let fixture: ComponentFixture<RequestPartnerModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestPartnerModalComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(RequestPartnerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
