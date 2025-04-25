import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { WebsocketService } from './shared/sockets/websocket.service';
import { CacheService } from '@services/cache/cache.service';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { of } from 'rxjs';
import { ActionsService } from './shared/services/actions.service';

describe('AppComponent', () => {
  let mockActionsService: Partial<ActionsService>;

  beforeEach(async () => {
    const mockSocket = {
      fromEvent: jest.fn().mockReturnValue(of({})),
      emit: jest.fn()
    };

    const mockWebsocketService = {
      runsockets: jest.fn(),
      listen: jest.fn().mockReturnValue(of({}))
    };

    const mockCacheService = {
      dataCache: signal({ access_token: 'mock-token' }),
      isLoggedIn: { set: jest.fn() }
    };

    mockActionsService = {
      isTokenExpired: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, AppComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: WebsocketService, useValue: mockWebsocketService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: Socket, useValue: mockSocket },
        { provide: ActionsService, useValue: mockActionsService }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'research-indicators' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('research-indicators');
  });
});
