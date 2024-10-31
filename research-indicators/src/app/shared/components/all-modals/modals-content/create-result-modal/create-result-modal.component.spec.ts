import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CreateResultModalComponent } from './create-result-modal.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('CreateResultModalComponent', () => {
  let component: CreateResultModalComponent;
  let fixture: ComponentFixture<CreateResultModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, CreateResultModalComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: new Map() },
            params: of({}) // Mock route parameters if needed
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateResultModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
