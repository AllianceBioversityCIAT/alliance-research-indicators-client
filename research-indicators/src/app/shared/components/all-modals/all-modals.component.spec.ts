import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AllModalsComponent } from './all-modals.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('AllModalsComponent', () => {
  let component: AllModalsComponent;
  let fixture: ComponentFixture<AllModalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AllModalsComponent],
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

    fixture = TestBed.createComponent(AllModalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
