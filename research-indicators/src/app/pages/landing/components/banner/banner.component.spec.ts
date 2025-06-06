import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BannerComponent } from './banner.component';
import { CognitoService } from '../../../../shared/services/cognito.service';
import { By } from '@angular/platform-browser';

// Mock del servicio Cognito
const cognitoServiceMock = {
  redirectToCognito: jest.fn()
};

describe('BannerComponent', () => {
  let component: BannerComponent;
  let fixture: ComponentFixture<BannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerComponent],
      providers: [
        { provide: CognitoService, useValue: cognitoServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe renderizar el título principal', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.banner-title')?.textContent).toContain('Simplifying reporting for impact and clarity');
  });

  it('debe renderizar la descripción', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.banner-description')?.textContent).toContain('Improve performance reporting');
  });

  it('debe renderizar el botón de inicio de sesión', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('p-button');
    expect(button).toBeTruthy();
    expect(button?.getAttribute('label')).toBe('Sign in to the platform');
  });

  it('debe llamar a redirectToCognito al hacer click en el botón', () => {
    const buttonDebug = fixture.debugElement.query(By.css('p-button'));
    buttonDebug.triggerEventHandler('onClick', null);
    expect(cognitoServiceMock.redirectToCognito).toHaveBeenCalled();
  });
});
