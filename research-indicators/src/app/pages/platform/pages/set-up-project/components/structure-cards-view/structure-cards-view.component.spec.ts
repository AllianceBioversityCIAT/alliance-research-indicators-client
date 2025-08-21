import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureCardsViewComponent } from './structure-cards-view.component';

describe('StructureCardsViewComponent', () => {
  let component: StructureCardsViewComponent;
  let fixture: ComponentFixture<StructureCardsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructureCardsViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StructureCardsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
