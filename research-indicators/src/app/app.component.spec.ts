import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { WebsocketService } from './shared/sockets/websocket.service';
import { CacheService } from './shared/services/cache.service';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { of } from 'rxjs';
import { OpenReplayService } from './shared/services/open-replay.service';
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
      isLoggedIn: { set: jest.fn() }
    };

    const mockOpenReplayService = {
      start: jest.fn().mockResolvedValue(undefined)
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
        { provide: OpenReplayService, useValue: mockOpenReplayService },
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

  it('should validate token on init', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const spy = jest.spyOn(mockActionsService, 'isTokenExpired');

    app.ngOnInit();

    expect(spy).toHaveBeenCalled();
  });

  it('should set isLoggedIn to true if token exists', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const mockLocalStorage = {
      getItem: jest.fn().mockReturnValue('mock-token')
    };
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

    app.ngOnInit();

    expect(app.cache.isLoggedIn.set).toHaveBeenCalledWith(true);
  });
});
