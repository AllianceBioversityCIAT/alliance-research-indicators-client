// jest.setup.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';

// Configuración global para todas las pruebas
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideHttpClientTesting()]
  });
});
