import { TestBed } from '@angular/core/testing';
import { DynamicFieldsService } from './dynamic-fields.service';
import { DynamicComponentSelectorService } from './components/dynamic-component-selector/dynamic-component-selector.service';
import { Validators } from '@angular/forms';

describe('DynamicFieldsService', () => {
  let service: DynamicFieldsService;
  let dynamicComponentSelectorSE: DynamicComponentSelectorService;

  const mockFields = [
    {
      type: 'input',
      attr: 'name',
      validations: {
        required: true,
        maxLength: 50
      }
    },
    {
      type: 'select',
      attr: 'country',
      validations: {
        required: true
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'input',
          attr: 'age',
          validations: {
            required: true,
            min: 18,
            max: 100
          }
        }
      ]
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DynamicFieldsService,
        {
          provide: DynamicComponentSelectorService,
          useValue: { fields: mockFields }
        }
      ]
    });
    service = TestBed.inject(DynamicFieldsService);
    dynamicComponentSelectorSE = TestBed.inject(DynamicComponentSelectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('flattenFields', () => {
    it('should flatten fields array and filter by types', () => {
      const types = ['input', 'select'];
      const result = service.flattenFields(mockFields, types);

      expect(result.length).toBe(3);
      expect(result[0].attr).toBe('name');
      expect(result[1].attr).toBe('country');
      expect(result[2].attr).toBe('age');
    });

    it('should return empty array if no matching types', () => {
      const types = ['checkbox'];
      const result = service.flattenFields(mockFields, types);

      expect(result.length).toBe(0);
    });
  });

  describe('init', () => {
    beforeEach(() => {
      service.init(mockFields);
    });

    it('should create form controls for each field', () => {
      expect(service.formGroup.get('name')).toBeTruthy();
      expect(service.formGroup.get('country')).toBeTruthy();
      expect(service.formGroup.get('age')).toBeTruthy();
    });

    it('should apply required validator when specified', () => {
      const nameControl = service.formGroup.get('name');
      const validators = nameControl?.validator?.({} as any);
      expect(validators?.['required']).toBeTruthy();
    });

    it('should apply maxLength validator when specified', () => {
      const nameControl = service.formGroup.get('name');
      const control = { value: 'a'.repeat(51) } as any;
      const validators = nameControl?.validator?.(control);
      expect(validators?.['maxlength']).toBeTruthy();
    });

    it('should apply min and max validators when specified', () => {
      const ageControl = service.formGroup.get('age');
      const controlMin = { value: 17 } as any;
      const controlMax = { value: 101 } as any;
      const validatorsMin = ageControl?.validator?.(controlMin);
      const validatorsMax = ageControl?.validator?.(controlMax);
      expect(validatorsMin?.['min']).toBeTruthy();
      expect(validatorsMax?.['max']).toBeTruthy();
    });
  });
});
