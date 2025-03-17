import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import GeneralInformationComponent from './general-information.component';

describe('GeneralInformationComponent', () => {
  let component: GeneralInformationComponent;
  let fixture: ComponentFixture<GeneralInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, GeneralInformationComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({})
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GeneralInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
