import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateResultModalComponent } from './create-result-modal.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CreateResultModalComponent', () => {
  let component: CreateResultModalComponent;
  let fixture: ComponentFixture<CreateResultModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateResultModalComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateResultModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
