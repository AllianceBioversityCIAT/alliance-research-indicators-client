import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import DynamicFieldsComponent from './dynamic-fields.component';
import { DynamicFieldsService } from './dynamic-fields.service';
import { ApiService } from '../../shared/services/api.service';
import { of } from 'rxjs';
import { DynamicComponentSelectorService } from './components/dynamic-component-selector/dynamic-component-selector.service';
import { CacheService } from '@services/cache/cache.service';

describe('DynamicFieldsComponent', () => {
  let component: DynamicFieldsComponent;
  let fixture: ComponentFixture<DynamicFieldsComponent>;
  let mockDynamicFieldsService: Partial<DynamicFieldsService>;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    formBuilder = new FormBuilder();
    mockDynamicFieldsService = {
      init: jest.fn(),
      formGroup: formBuilder.group({}),
      flattenFieldsList: []
    };

    await TestBed.configureTestingModule({
      imports: [DynamicFieldsComponent, ReactiveFormsModule],
      providers: [
        { provide: DynamicFieldsService, useValue: mockDynamicFieldsService },
        { provide: ApiService, useValue: { GET_ViewComponents: jest.fn().mockReturnValue(of([])) } },
        { provide: DynamicComponentSelectorService, useValue: { fields: [] } },
        { provide: CacheService, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with data', () => {
    const testData = {
      name: 'John',
      age: 30,
      job: 'Developer',
      data: {
        label: 'Sample Label',
        details: {
          info: 'Additional Info'
        }
      }
    };

    const testFields = [
      {
        type: 'section',
        attribute: 'data',
        fields: [
          {
            type: 'title',
            text: 'Data Section'
          },
          {
            type: 'input',
            name: 'label',
            label: 'Label',
            validators: [Validators.required]
          },
          {
            type: 'block',
            attribute: 'details',
            fields: [
              {
                type: 'input',
                name: 'info',
                label: 'Info',
                validators: []
              }
            ]
          }
        ]
      },
      {
        type: 'input',
        name: 'job',
        label: 'Job',
        validators: []
      },
      {
        type: 'input',
        name: 'name',
        label: 'Name',
        validators: [Validators.required]
      },
      {
        type: 'input',
        name: 'age',
        label: 'Age',
        validators: [Validators.required, Validators.min(18)]
      }
    ];

    component.data = testData;
    component.fields = testFields;
    component.ngOnInit();

    expect(component.form).toBeTruthy();
    expect(component.form.get('name')?.value).toBe('John');
    expect(component.form.get('age')?.value).toBe(30);
    expect(component.form.get('job')?.value).toBe('Developer');
    expect(component.form.get('data.label')?.value).toBe('Sample Label');
    expect(component.form.get('data.details.info')?.value).toBe('Additional Info');
  });

  it('should handle empty data in buildFormGroup', () => {
    const testFields = [
      {
        type: 'input',
        name: 'test',
        label: 'Test',
        validators: []
      }
    ];

    const formGroup = component.buildFormGroup(testFields, null);
    expect(formGroup.get('test')?.value).toBe('');
  });

  it('should handle section without attribute in buildFormGroup', () => {
    const testFields = [
      {
        type: 'section',
        fields: [
          {
            type: 'input',
            name: 'test',
            label: 'Test',
            validators: []
          }
        ]
      }
    ];

    const formGroup = component.buildFormGroup(testFields, { test: 'value' });
    expect(formGroup.get('test')?.value).toBe('value');
  });

  it('should handle save with invalid form', () => {
    const testFields = [
      {
        type: 'input',
        name: 'test',
        label: 'Test',
        validators: [Validators.required]
      }
    ];

    component.fields = testFields;
    component.ngOnInit();
    component.form.reset();
    const consoleSpy = jest.spyOn(console, 'log');
    component.save();
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('should handle save with valid form', () => {
    const testFields = [
      {
        type: 'input',
        name: 'test',
        label: 'Test',
        validators: []
      }
    ];

    component.fields = testFields;
    component.ngOnInit();
    component.form.get('test')?.setValue('value');

    const consoleSpy = jest.spyOn(console, 'log');
    component.save();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should handle unknown field type in buildFormGroup', () => {
    const testFields = [
      {
        type: 'unknown',
        name: 'test',
        label: 'Test'
      }
    ];

    const formGroup = component.buildFormGroup(testFields, {});
    expect(formGroup.controls).toEqual({});
  });
});
