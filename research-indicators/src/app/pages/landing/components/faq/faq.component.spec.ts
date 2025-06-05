import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FaqComponent } from './faq.component';
import { LandingTextsService } from '../../services/landing-texts.service';
import { signal } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AccordionModule } from 'primeng/accordion';

// Mock de preguntas frecuentes
const mockFaqList = [
  { question: '¿Qué es la plataforma?', answer: 'Es una herramienta para reportar.' },
  { question: '¿Cómo inicio sesión?', answer: 'Haz clic en el botón de inicio de sesión.' }
];

const landingTextsServiceMock = {
  faqList: signal(mockFaqList)
};

describe('FaqComponent', () => {
  let component: FaqComponent;
  let fixture: ComponentFixture<FaqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqComponent, AccordionModule],
      providers: [
        { provide: LandingTextsService, useValue: landingTextsServiceMock },
        provideAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe renderizar el título principal y subtítulo', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.faq-header-title')?.textContent).toContain('Asked Questions');
    expect(compiled.querySelector('.faq-header-subtitle')?.textContent).toContain('FRECUENTLY');
  });

  it('debe renderizar todas las preguntas frecuentes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const preguntas = compiled.querySelectorAll('p-accordion-header');
    expect(preguntas.length).toBe(mockFaqList.length);
    mockFaqList.forEach((faq, idx) => {
      expect(preguntas[idx].textContent).toContain(faq.question);
    });
  });

  it('debe renderizar todas las respuestas', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const respuestas = compiled.querySelectorAll('p-accordion-content p');
    expect(respuestas.length).toBe(mockFaqList.length);
    mockFaqList.forEach((faq, idx) => {
      expect(respuestas[idx].textContent).toContain(faq.answer);
    });
  });

  it('debe actualizar las preguntas cuando cambia el servicio', () => {
    const newFaqList = [
      { question: 'Nueva pregunta 1', answer: 'Nueva respuesta 1' },
      { question: 'Nueva pregunta 2', answer: 'Nueva respuesta 2' }
    ];
    
    landingTextsServiceMock.faqList.set(newFaqList);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const preguntas = compiled.querySelectorAll('p-accordion-header');
    expect(preguntas.length).toBe(newFaqList.length);
    newFaqList.forEach((faq, idx) => {
      expect(preguntas[idx].textContent).toContain(faq.question);
    });
  });

  it('debe tener la estructura correcta del acordeón', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const accordion = compiled.querySelector('p-accordion');
    expect(accordion).toBeTruthy();
    expect(accordion?.getAttribute('expandIcon')).toBe('pi pi-plus');
    expect(accordion?.getAttribute('collapseIcon')).toBe('pi pi-minus');
  });

  it('debe manejar correctamente el caso de lista vacía', () => {
    landingTextsServiceMock.faqList.set([]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const preguntas = compiled.querySelectorAll('p-accordion-header');
    expect(preguntas.length).toBe(0);
  });
});
