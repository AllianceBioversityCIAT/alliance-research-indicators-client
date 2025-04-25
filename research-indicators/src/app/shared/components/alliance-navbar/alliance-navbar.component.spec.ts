import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllianceNavbarComponent } from './alliance-navbar.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { CacheService } from '@services/cache/cache.service';
import { DarkModeService } from '@services/dark-mode.service';

// Mock ResizeObserver
class ResizeObserverMock {
  observe(target: Element) {
    // Mock implementation
    console.log('Mock observe called on:', target);
  }
  unobserve(target: Element) {
    // Mock implementation
    console.log('Mock unobserve called on:', target);
  }
  disconnect() {
    // Mock implementation
    console.log('Mock disconnect called');
  }
}

global.ResizeObserver = ResizeObserverMock;

describe('AllianceNavbarComponent', () => {
  let component: AllianceNavbarComponent;
  let fixture: ComponentFixture<AllianceNavbarComponent>;

  const mockCacheService = {
    dataCache: signal({
      user: {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        roleName: 'Test Role'
      }
    }),
    isLoggedIn: signal(true),
    isValidatingToken: signal(false),
    navbarHeight: signal(0),
    windowHeight: signal(0),
    hasSmallScreen: jest.fn(() => true)
  };

  const mockDarkModeService = {
    isDarkMode: signal(false)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllianceNavbarComponent, HttpClientTestingModule, RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: CacheService, useValue: mockCacheService },
        { provide: DarkModeService, useValue: mockDarkModeService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AllianceNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
