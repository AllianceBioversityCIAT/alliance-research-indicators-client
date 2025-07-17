import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalToastComponent } from './global-toast.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActionsService } from '../../services/actions.service';
import { MessageService } from 'primeng/api';
import { signal } from '@angular/core';
import { ToastMessage } from '../../interfaces/toast-message.interface';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('GlobalToastComponent', () => {
  let component: GlobalToastComponent;
  let fixture: ComponentFixture<GlobalToastComponent>;
  let actionsServiceMock: Partial<ActionsService>;
  let messageServiceMock: Partial<MessageService>;

  beforeEach(async () => {
    if (!window.Element.prototype.animate) {
      window.Element.prototype.animate = () =>
        ({
          play: jest.fn(),
          pause: jest.fn(),
          finish: jest.fn(),
          cancel: jest.fn(),
          reverse: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          onfinish: null,
          oncancel: null,
          currentTime: 0,
          playbackRate: 1,
          startTime: 0,
          playState: 'finished',
          finished: Promise.resolve(),
          effect: null,
          id: '',
          timeline: null
        }) as any;
    }
    actionsServiceMock = {
      toastMessage: signal<ToastMessage>({ severity: 'info', summary: '', detail: '' })
    };
    messageServiceMock = {
      add: jest.fn()
    };
    await TestBed.configureTestingModule({
      imports: [GlobalToastComponent, HttpClientTestingModule],
      providers: [
        { provide: ActionsService, useValue: actionsServiceMock },
        { provide: MessageService, useValue: messageServiceMock },
        provideAnimations()
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(GlobalToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call messageService.add if summary is empty', () => {
    (actionsServiceMock.toastMessage as any).set({ severity: 'info', summary: '', detail: '' });
    fixture.detectChanges();
    expect(messageServiceMock.add).not.toHaveBeenCalled();
  });
});
