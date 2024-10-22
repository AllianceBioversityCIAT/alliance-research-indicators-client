import { ComponentFixture, TestBed } from '@angular/core/testing';
import IndicatorComponent from './indicator.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IndicatorsService } from '@services/indicators.service';

describe('IndicatorComponent', () => {
  let component: IndicatorComponent;
  let fixture: ComponentFixture<IndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        IndicatorComponent,
        HttpClientTestingModule // Importa el módulo de pruebas de HttpClient
      ],
      providers: [IndicatorsService]
    }).compileComponents();

    fixture = TestBed.createComponent(IndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
