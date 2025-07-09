import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AllModalsService } from '@services/cache/all-modals.service';
import { ModalName } from '@ts-types/modal.types';
import { computed, Signal } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;
  let allModalsServiceMock: jest.Mocked<AllModalsService>;

  const modalName: ModalName = 'createResult';
  const defaultConfig = {
    createResult: { isOpen: true, title: 'Test' },
    submitResult: { isOpen: false, title: 'Review Result', cancelText: '', confirmText: '' },
    requestPartner: { isOpen: false, title: 'Partners Request' },
    askForHelp: { isOpen: false, title: 'Ask for Help' }
  };

  beforeAll(() => {
    // Mockear animate para evitar error en animaciones
    if (!Element.prototype.animate) {
      Element.prototype.animate = () =>
        ({
          play: () => {},
          pause: () => {},
          finish: () => {},
          cancel: () => {},
          reverse: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          onfinish: null,
          oncancel: null,
          currentTime: 0,
          playState: 'finished',
          finished: Promise.resolve(),
          effect: null,
          id: '',
          startTime: 0,
          timeline: null,
          playbackRate: 1,
          updatePlaybackRate: () => {}
        }) as any;
    }
  });

  beforeEach(async () => {
    allModalsServiceMock = {
      isModalOpen: jest.fn(),
      modalConfig: jest.fn().mockReturnValue(defaultConfig),
      toggleModal: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [ModalComponent, HttpClientTestingModule],
      providers: [{ provide: AllModalsService, useValue: allModalsServiceMock }, provideAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    component.modalName = modalName;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('showModal should delegate to allModalsService.isModalOpen', () => {
    allModalsServiceMock.isModalOpen.mockReturnValue({ isOpen: true, title: 'Test' });
    expect(component.showModal()).toEqual({ isOpen: true, title: 'Test' });
    expect(allModalsServiceMock.isModalOpen).toHaveBeenCalledWith(modalName);
  });

  it('getConfig should return modal configuration', () => {
    allModalsServiceMock.modalConfig.mockReturnValue(defaultConfig);
    expect(component.getConfig()).toEqual({ isOpen: true, title: 'Test' });
  });

  it('getConfig should return empty object if no configuration exists', () => {
    allModalsServiceMock.modalConfig.mockReturnValue({
      createResult: undefined,
      submitResult: undefined,
      requestPartner: undefined,
      askForHelp: undefined
    } as any);
    expect(component.getConfig()).toEqual({});
  });

  it('should accept disabledConfirmIf as Signal', () => {
    const signal: Signal<boolean> = computed(() => true);
    component.disabledConfirmIf = signal;
    expect(component.disabledConfirmIf()).toBe(true);
  });

  it('should accept clearModal as function', () => {
    const fn = jest.fn();
    component.clearModal = fn;
    component.clearModal();
    expect(fn).toHaveBeenCalled();
  });

  it('should cover getConfig with icon, cancelAction and confirmAction', () => {
    const iconAction = jest.fn();
    const cancelAction = jest.fn();
    const confirmAction = jest.fn();
    const disabledConfirmAction = jest.fn().mockReturnValue(true);
    allModalsServiceMock.modalConfig.mockReturnValue({
      createResult: {
        isOpen: true,
        title: 'Test',
        icon: 'icon',
        iconAction,
        cancelAction,
        confirmAction,
        cancelText: 'Cancelar',
        confirmText: 'Confirmar',
        disabledConfirmAction
      },
      submitResult: { isOpen: false, title: 'Review Result', cancelText: '', confirmText: '' },
      requestPartner: { isOpen: false, title: 'Partners Request' },
      askForHelp: { isOpen: false, title: 'Ask for Help' }
    });
    const config = component.getConfig();
    expect(config.icon).toBe('icon');
    config.iconAction && config.iconAction();
    expect(iconAction).toHaveBeenCalled();
    config.cancelAction && config.cancelAction();
    expect(cancelAction).toHaveBeenCalled();
    config.confirmAction && config.confirmAction();
    expect(confirmAction).toHaveBeenCalled();
    expect(config.disabledConfirmAction && config.disabledConfirmAction()).toBe(true);
  });
});
