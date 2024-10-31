import { ComponentFixture, TestBed } from '@angular/core/testing';
import AboutIndicatorsComponent from './about-indicators.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IndicatorsService } from '@services/control-list/indicators.service';

describe('AboutIndicatorsComponent', () => {
  let component: AboutIndicatorsComponent;
  let fixture: ComponentFixture<AboutIndicatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AboutIndicatorsComponent,
        HttpClientTestingModule // Importa el módulo de pruebas de HttpClient
      ],
      providers: [IndicatorsService]
    }).compileComponents();

    fixture = TestBed.createComponent(AboutIndicatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
