import { Component, inject, OnInit } from '@angular/core';
import { DynamicComponentSelectorComponent } from './components/dynamic-component-selector/dynamic-component-selector.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicBlockComponent } from './components/dynamic-block/dynamic-block.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dynamic-fields',
  standalone: true,
  imports: [DynamicComponentSelectorComponent, ReactiveFormsModule, DynamicBlockComponent, CommonModule],
  templateUrl: './dynamic-fields.component.html',
  styleUrl: './dynamic-fields.component.scss'
})
export default class DynamicFieldsComponent implements OnInit {
  form!: FormGroup;
  fields!: any[];
  data!: any;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    // Datos iniciales que recibes
    this.data = {
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

    // Estructura de campos con atributos contenedores
    this.fields = [
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
    // Construir el formulario reactivo con datos iniciales
    this.form = this.buildFormGroup(this.fields, this.data);
  }

  buildFormGroup(fields: any[], data: any): FormGroup {
    const group = this.fb.group({});
    fields.forEach(field => {
      switch (field.type) {
        case 'input':
          group.addControl(field.name, this.fb.control(data ? data[field.name] : '', field.validators || []));
          break;

        case 'section':
        case 'block':
          const nestedData = field.attribute && data ? data[field.attribute] : data;
          const nestedGroup = this.buildFormGroup(field.fields, nestedData);
          if (field.attribute) {
            group.addControl(field.attribute, nestedGroup);
          } else {
            // Fusionar controles si no se especifica atributo
            Object.assign(group.controls, nestedGroup.controls);
          }
          break;

        // Otros casos
        default:
          break;
      }
    });
    return group;
  }

  save() {
    if (this.form.valid) {
    }
  }
}
