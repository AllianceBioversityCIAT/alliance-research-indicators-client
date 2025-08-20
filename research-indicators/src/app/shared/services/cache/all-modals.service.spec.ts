import { TestBed } from '@angular/core/testing';
import { AllModalsService } from './all-modals.service';
import { CreateResultManagementService } from '@shared/components/all-modals/modals-content/create-result-modal/services/create-result-management.service';
import { ModalName } from '@ts-types/modal.types';

describe('AllModalsService', () => {
  let service: AllModalsService;
  let mockCreateResultManagementService: jest.Mocked<CreateResultManagementService>;

  beforeEach(() => {
    const mockService = {
      resultPageStep: {
        set: jest.fn()
      }
    } as any;

    TestBed.configureTestingModule({
      providers: [AllModalsService, { provide: CreateResultManagementService, useValue: mockService }]
    });
    service = TestBed.inject(AllModalsService);
    mockCreateResultManagementService = TestBed.inject(CreateResultManagementService) as jest.Mocked<CreateResultManagementService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(service.partnerRequestSection()).toBe(null);
    expect(service.modalConfig()).toEqual({
      createResult: {
        isOpen: false,
        title: 'Create a result'
      },
      submitResult: {
        isOpen: false,
        title: 'Review Result',
        cancelText: 'Cancel',
        confirmText: 'Confirm',
        cancelAction: expect.any(Function),
        confirmAction: expect.any(Function),
        disabledConfirmAction: expect.any(Function)
      },
      requestPartner: {
        isOpen: false,
        title: 'Partners Request'
      },
      createOicrResult: {
        isOpen: false,
        title: 'OICR Result'
      },
      askForHelp: {
        isOpen: false,
        title: 'Ask for Help'
      }
    });
  });

  it('should set partner request section', () => {
    service.setPartnerRequestSection('test-section');
    expect(service.partnerRequestSection()).toBe('test-section');
  });

  it('should set go back function', () => {
    const mockFn = jest.fn();
    service.setGoBackFunction(mockFn);
    expect(service.goBackFunction).toBe(mockFn);
  });

  it('should set submit review function', () => {
    const mockFn = jest.fn();
    service.setSubmitReview(mockFn);
    expect(service.submitReview).toBe(mockFn);
  });

  it('should set create partner function', () => {
    const mockFn = jest.fn();
    service.setCreatePartner(mockFn);
    expect(service.createPartner).toBe(mockFn);
  });

  it('should set disabled confirm partner function', () => {
    const mockFn = jest.fn().mockReturnValue(true);
    service.setDisabledConfirmPartner(mockFn);
    expect(service.disabledConfirmPartner).toBe(mockFn);
  });

  it('should set disabled submit review function', () => {
    const mockFn = jest.fn().mockReturnValue(false);
    service.setDisabledSubmitReview(mockFn);
    expect(service.disabledSubmitReview).toBe(mockFn);
  });

  it('should update modal with step 1', () => {
    service.updateModal(1);
    const modalConfig = service.modalConfig();
    expect(modalConfig.createResult.title).toBe('Create A Result');
    expect(modalConfig.createResult.icon).toBe('arrow_back');
    expect(modalConfig.createResult.iconAction).toBeDefined();
  });

  it('should update modal with step other than 1', () => {
    service.updateModal(2);
    const modalConfig = service.modalConfig();
    expect(modalConfig.createResult.title).toBe('Create A Result');
    expect(modalConfig.createResult.icon).toBeUndefined();
    expect(modalConfig.createResult.iconAction).toBeUndefined();
  });

  it('should toggle modal open', () => {
    const modalName: ModalName = 'createResult';
    service.toggleModal(modalName);
    expect(service.modalConfig()[modalName].isOpen).toBe(true);
    expect(mockCreateResultManagementService.resultPageStep.set).toHaveBeenCalledWith(0);
  });

  it('should toggle modal closed', () => {
    const modalName: ModalName = 'submitResult';
    // First open the modal
    service.openModal(modalName);
    expect(service.modalConfig()[modalName].isOpen).toBe(true);

    // Then toggle it closed
    service.toggleModal(modalName);
    expect(service.modalConfig()[modalName].isOpen).toBe(false);
  });

  it('should close modal', () => {
    const modalName: ModalName = 'askForHelp';
    service.openModal(modalName);
    expect(service.modalConfig()[modalName].isOpen).toBe(true);

    service.closeModal(modalName);
    expect(service.modalConfig()[modalName].isOpen).toBe(false);
  });

  it('should close createResult modal and reset step', () => {
    const modalName: ModalName = 'createResult';
    service.openModal(modalName);
    service.closeModal(modalName);
    expect(service.modalConfig()[modalName].isOpen).toBe(false);
    expect(mockCreateResultManagementService.resultPageStep.set).toHaveBeenCalledWith(0);
  });

  it('should open modal', () => {
    const modalName: ModalName = 'requestPartner';
    service.openModal(modalName);
    expect(service.modalConfig()[modalName].isOpen).toBe(true);
  });

  it('should return modal config for isModalOpen', () => {
    const modalName: ModalName = 'submitResult';
    const modalConfig = service.isModalOpen(modalName);
    expect(modalConfig).toEqual(service.modalConfig()[modalName]);
  });

  it('should return false when no modals are open', () => {
    // Ensure all modals are closed first
    service.closeAllModals();
    expect(service.isAnyModalOpen()).toBe(false);
  });

  it('should return true when at least one modal is open', () => {
    service.openModal('createResult');
    expect(service.isAnyModalOpen()).toBe(true);
  });

  it('should close all modals', () => {
    // Open multiple modals
    service.openModal('createResult');
    service.openModal('submitResult');
    service.openModal('requestPartner');
    service.openModal('askForHelp');

    expect(service.isAnyModalOpen()).toBe(true);

    service.closeAllModals();

    expect(service.modalConfig().createResult.isOpen).toBe(false);
    expect(service.modalConfig().submitResult.isOpen).toBe(false);
    expect(service.modalConfig().requestPartner.isOpen).toBe(false);
    expect(service.modalConfig().createOicrResult.isOpen).toBe(false);
    expect(service.modalConfig().askForHelp.isOpen).toBe(false);
    expect(mockCreateResultManagementService.resultPageStep.set).toHaveBeenCalledWith(0);
  });

  it('should execute submit review action when available', () => {
    const mockSubmitReview = jest.fn();
    service.setSubmitReview(mockSubmitReview);

    const modalConfig = service.modalConfig();
    modalConfig.submitResult.confirmAction?.();

    expect(mockSubmitReview).toHaveBeenCalled();
  });

  it('should execute cancel action for submit result', () => {
    const modalConfig = service.modalConfig();
    const initialIsOpen = modalConfig.submitResult.isOpen;

    modalConfig.submitResult.cancelAction?.();

    expect(service.modalConfig().submitResult.isOpen).toBe(!initialIsOpen);
  });

  it('should return disabled state from disabled submit review function', () => {
    const mockDisabledFn = jest.fn().mockReturnValue(true);
    service.setDisabledSubmitReview(mockDisabledFn);

    const modalConfig = service.modalConfig();
    const isDisabled = modalConfig.submitResult.disabledConfirmAction?.();

    expect(isDisabled).toBe(true);
    expect(mockDisabledFn).toHaveBeenCalled();
  });

  it('should return false when disabled submit review function is not set', () => {
    const modalConfig = service.modalConfig();
    const isDisabled = modalConfig.submitResult.disabledConfirmAction?.();

    expect(isDisabled).toBe(false);
  });

  it('should execute go back function when icon action is called', () => {
    const mockGoBack = jest.fn();
    service.setGoBackFunction(mockGoBack);
    service.updateModal(1);

    const modalConfig = service.modalConfig();
    modalConfig.createResult.iconAction?.();

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('should handle effect when result page step changes', () => {
    // Simulate the effect by calling updateModal directly
    service.updateModal(1);
    expect(service.modalConfig().createResult.icon).toBe('arrow_back');

    service.updateModal(0);
    expect(service.modalConfig().createResult.icon).toBeUndefined();
  });

  it('should maintain modal state when updating non-createResult modals', () => {
    service.openModal('submitResult');
    service.updateModal(1);

    expect(service.modalConfig().submitResult.isOpen).toBe(true);
    expect(service.modalConfig().createResult.isOpen).toBe(false);
  });

  it('should set modal width', () => {
    const modalName: ModalName = 'createResult';
    service.setModalWidth(modalName, true);
    expect(service.modalConfig()[modalName].isWide).toBe(true);

    service.setModalWidth(modalName, false);
    expect(service.modalConfig()[modalName].isWide).toBe(false);
  });
});
