import { ComponentFixture, TestBed } from '@angular/core/testing';
import LandingComponent from './landing.component';
import { BannerComponent } from './components/banner/banner.component';
import { FeaturesComponent } from './components/features/features.component';
import { DiscoverHeroComponent } from './components/discover-hero/discover-hero.component';
import { FooterComponent } from './components/footer/footer.component';
import { FaqComponent } from './components/faq/faq.component';
import { VersionNumberComponent } from './components/version-number/version-number.component';
import { MyProjectsComponent } from './components/my-projects/my-projects.component';
import { LandingTextsService } from './services/landing-texts.service';
import { CognitoService } from '@shared/services/cognito.service';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;
  let landingTextsService: LandingTextsService;
  let cognitoService: CognitoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LandingComponent,
        BannerComponent,
        FeaturesComponent,
        DiscoverHeroComponent,
        MyProjectsComponent,
        FaqComponent,
        FooterComponent,
        VersionNumberComponent
      ],
      providers: [
        LandingTextsService,
        {
          provide: CognitoService,
          useValue: {
            redirectToCognito: jest.fn()
          }
        },
        provideAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all child components', () => {
    const compiled = fixture.nativeElement;
    
    expect(compiled.querySelector('app-banner')).toBeTruthy();
    expect(compiled.querySelector('app-features')).toBeTruthy();
    expect(compiled.querySelector('app-discover-hero')).toBeTruthy();
    expect(compiled.querySelector('app-my-projects')).toBeTruthy();
    expect(compiled.querySelector('app-faq')).toBeTruthy();
    expect(compiled.querySelector('app-footer')).toBeTruthy();
    expect(compiled.querySelector('app-version-number')).toBeTruthy();
  });

  it('should have correct container class', () => {
    const compiled = fixture.nativeElement;
    const container = compiled.querySelector('.container');
    
    expect(container).toBeTruthy();
    expect(container.classList.contains('container')).toBeTruthy();
  });

  it('should initialize with correct layout structure', () => {
    const compiled = fixture.nativeElement;
    const container = compiled.querySelector('.container');
    
    expect(container.children.length).toBe(7); // Verifica que tenga todos los componentes hijos
    expect(container.children[0].tagName.toLowerCase()).toBe('app-banner');
    expect(container.children[1].tagName.toLowerCase()).toBe('app-features');
    expect(container.children[2].tagName.toLowerCase()).toBe('app-discover-hero');
    expect(container.children[3].tagName.toLowerCase()).toBe('app-my-projects');
    expect(container.children[4].tagName.toLowerCase()).toBe('app-faq');
    expect(container.children[5].tagName.toLowerCase()).toBe('app-footer');
    expect(container.children[6].tagName.toLowerCase()).toBe('app-version-number');
  });
});
