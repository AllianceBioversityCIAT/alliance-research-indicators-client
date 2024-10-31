import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import PlatformComponent from './platform.component';
import { CacheService } from '@services/cache/cache.service';
import { WebsocketService } from '@sockets/websocket.service';
import { DarkModeService } from '@services/dark-mode.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { signal } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PlatformComponent', () => {
  let component: PlatformComponent;
  let fixture: ComponentFixture<PlatformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, PlatformComponent, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: CacheService, useValue: { dataCache: signal({}), isLoggedIn: { set: jest.fn() } } },
        { provide: WebsocketService, useValue: {} },
        {
          provide: DarkModeService,
          useValue: {
            isDarkModeEnabled: () => false,
            toggleDarkMode: () => {}
          }
        }
      ]
    }).compileComponents();

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      }))
    });

    fixture = TestBed.createComponent(PlatformComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
