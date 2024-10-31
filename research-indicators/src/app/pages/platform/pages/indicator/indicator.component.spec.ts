import { ComponentFixture, TestBed } from '@angular/core/testing';
import IndicatorComponent from './indicator.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IndicatorsService } from '@services/control-list/indicators.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('IndicatorComponent', () => {
  let component: IndicatorComponent;
  let fixture: ComponentFixture<IndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndicatorComponent, HttpClientTestingModule],
      providers: [
        IndicatorsService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: new Map() },
            params: of({}) // Mock de parámetros de ruta
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
