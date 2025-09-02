import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadOicrTemplateComponent } from './download-oicr-template.component';

describe('DownloadOicrTemplateComponent', () => {
  let component: DownloadOicrTemplateComponent;
  let fixture: ComponentFixture<DownloadOicrTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadOicrTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DownloadOicrTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
