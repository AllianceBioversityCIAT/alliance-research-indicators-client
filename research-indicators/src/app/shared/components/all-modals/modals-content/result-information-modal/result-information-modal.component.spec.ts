import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultInformationModalComponent } from './result-information-modal.component';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { PLATFORM_COLOR_MAP } from '@shared/constants/platform-colors';

describe('ResultInformationModalComponent', () => {
  let component: ResultInformationModalComponent;
  let fixture: ComponentFixture<ResultInformationModalComponent>;
  let allModalsMock: { selectedResultForInfo: jest.Mock; closeModal: jest.Mock };

  beforeEach(async () => {
    allModalsMock = {
      selectedResultForInfo: jest.fn().mockReturnValue(undefined),
      closeModal: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ResultInformationModalComponent],
      providers: [{ provide: AllModalsService, useValue: allModalsMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultInformationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('close should call allModals.closeModal', () => {
    component.close();
    expect(allModalsMock.closeModal).toHaveBeenCalledWith('resultInformation');
  });

  describe('getPlatformColors', () => {
    it('should return undefined for unknown code', () => {
      expect(component.getPlatformColors('UNKNOWN' as any)).toBeUndefined();
    });
    it('should return the mapped colors for a known platform code', () => {
      expect(component.getPlatformColors('PRMS')).toEqual(PLATFORM_COLOR_MAP['PRMS']);
      expect(component.getPlatformColors('STAR')).toEqual(PLATFORM_COLOR_MAP['STAR']);
      expect(component.getPlatformColors('TIP')).toEqual(PLATFORM_COLOR_MAP['TIP']);
    });
  });

  describe('formatResultCode', () => {
    it('should return empty for null/undefined', () => {
      expect(component.formatResultCode(null)).toBe('');
      expect(component.formatResultCode(undefined)).toBe('');
    });
    it('should pad numbers/strings and return empty for empty string', () => {
      expect(component.formatResultCode('')).toBe('');
      expect(component.formatResultCode('7')).toBe('007');
      expect(component.formatResultCode(12)).toBe('012');
      expect(component.formatResultCode(123)).toBe('123');
    });
  });

  describe('getValue', () => {
    it('should return - when no result available', () => {
      allModalsMock.selectedResultForInfo.mockReturnValueOnce(undefined);
      expect(component.getValue()).toBe('-');
    });

    it('should return - when no levers present or empty array', () => {
      const r: any = { result_levers: [] };
      expect(component.getValue(r)).toBe('-');
      expect(component.getValue({} as any)).toBe('-');
    });

    it('should return - when result_levers is not an array (defensive)', () => {
      const r: any = { result_levers: { bogus: true } };
      expect(component.getValue(r)).toBe('-');
    });

    it('should return - when no primary levers', () => {
      const r: any = { result_levers: [{ is_primary: 0 }, { is_primary: '0' }] };
      expect(component.getValue(r)).toBe('-');
    });

    it('should join short_name of primary levers and filter empties', () => {
      const r: any = {
        result_levers: [
          { is_primary: 1, lever: { short_name: 'A' } },
          { is_primary: '1', lever: { short_name: '' } },
          { is_primary: 1, lever: { short_name: 'B' } },
        ],
      };
      expect(component.getValue(r)).toBe('A, B');
    });

    it('should return - when primary levers have undefined lever/short_name (nullish coalescing branch)', () => {
      const r: any = {
        result_levers: [
          { is_primary: 1, lever: undefined },
        ],
      };
      expect(component.getValue(r)).toBe('-');
    });

    it('should return - when after filtering empty names nothing remains', () => {
      const r: any = {
        result_levers: [
          { is_primary: 1, lever: { short_name: '' } },
          { is_primary: '1', lever: { short_name: '' } },
        ],
      };
      expect(component.getValue(r)).toBe('-');
    });
  });
});


