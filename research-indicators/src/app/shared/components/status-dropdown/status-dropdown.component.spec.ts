import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusDropdownComponent } from './status-dropdown.component';

describe('StatusDropdownComponent', () => {
  let component: StatusDropdownComponent;
  let fixture: ComponentFixture<StatusDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusDropdownComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StatusDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.statusId).toBe(0);
    expect(component.statusName).toBe('');
    expect(component.isOpen()).toBe(false);
  });

  describe('getAvailableStatuses', () => {
    it('should return empty array for unknown statusId', () => {
      component.statusId = 999;
      expect(component.getAvailableStatuses()).toEqual([]);
    });

    it('should return next and special statuses for Draft (4)', () => {
      component.statusId = 4;
      const statuses = component.getAvailableStatuses();
      expect(statuses).toHaveLength(3);
      expect(statuses[0]).toEqual({
        id: 12,
        name: 'Science Edition',
        direction: 'next'
      });
      expect(statuses[1]).toEqual({
        id: 11,
        name: 'Postpone',
        direction: 'previous',
        icon: 'postpone'
      });
      expect(statuses[2]).toEqual({
        id: 15,
        name: 'Do not approve',
        direction: 'previous',
        icon: 'reject'
      });
    });

    it('should return previous and next status for Science Edition (12)', () => {
      component.statusId = 12;
      const statuses = component.getAvailableStatuses();
      expect(statuses).toHaveLength(2);
      expect(statuses[0]).toEqual({
        id: 4,
        name: 'Draft',
        direction: 'previous'
      });
      expect(statuses[1]).toEqual({
        id: 13,
        name: 'KM Curation',
        direction: 'next'
      });
    });

    it('should return previous and next status for KM Curation (13)', () => {
      component.statusId = 13;
      const statuses = component.getAvailableStatuses();
      expect(statuses).toHaveLength(2);
      expect(statuses[0]).toEqual({
        id: 12,
        name: 'Science Edition',
        direction: 'previous'
      });
      expect(statuses[1]).toEqual({
        id: 14,
        name: 'Published',
        direction: 'next'
      });
    });

    it('should return previous status for Published (14)', () => {
      component.statusId = 14;
      const statuses = component.getAvailableStatuses();
      expect(statuses).toHaveLength(1);
      expect(statuses[0]).toEqual({
        id: 13,
        name: 'KM Curation',
        direction: 'previous'
      });
    });
  });

  describe('toggleDropdown', () => {
    it('should toggle isOpen from false to true', () => {
      component.isOpen.set(false);
      const event = new Event('click');
      const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');

      component.toggleDropdown(event);

      expect(component.isOpen()).toBe(true);
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should toggle isOpen from true to false', () => {
      component.isOpen.set(true);
      const event = new Event('click');
      const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');

      component.toggleDropdown(event);

      expect(component.isOpen()).toBe(false);
      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe('selectStatus', () => {
    it('should emit statusChange event and close dropdown', () => {
      component.isOpen.set(true);
      const event = new Event('click');
      const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');
      const emitSpy = jest.spyOn(component.statusChange, 'emit');

      component.selectStatus(13, event);

      expect(emitSpy).toHaveBeenCalledWith(13);
      expect(component.isOpen()).toBe(false);
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should emit correct statusId', () => {
      component.isOpen.set(true);
      const event = new Event('click');
      const emitSpy = jest.spyOn(component.statusChange, 'emit');

      component.selectStatus(12, event);

      expect(emitSpy).toHaveBeenCalledWith(12);
    });
  });

  describe('onDocumentClick', () => {
    it('should close dropdown when clicking outside', () => {
      component.isOpen.set(true);
      const event = new MouseEvent('click');
      const target = document.createElement('div');
      jest.spyOn(event, 'target', 'get').mockReturnValue(target);
      jest.spyOn(target, 'closest').mockReturnValue(null);

      component.onDocumentClick(event);

      expect(component.isOpen()).toBe(false);
    });

    it('should not close dropdown when clicking inside container', () => {
      component.isOpen.set(true);
      const event = new MouseEvent('click');
      const target = document.createElement('div');
      const container = document.createElement('div');
      container.className = 'status-dropdown-container';
      jest.spyOn(event, 'target', 'get').mockReturnValue(target);
      jest.spyOn(target, 'closest').mockReturnValue(container);

      component.onDocumentClick(event);

      expect(component.isOpen()).toBe(true);
    });

    it('should handle null target gracefully', () => {
      component.isOpen.set(true);
      const event = new MouseEvent('click');
      jest.spyOn(event, 'target', 'get').mockReturnValue(null);

      component.onDocumentClick(event);

      expect(component.isOpen()).toBe(false);
    });
  });

  describe('component inputs', () => {
    it('should accept statusId input', () => {
      component.statusId = 12;
      fixture.detectChanges();
      expect(component.statusId).toBe(12);
    });

    it('should accept statusName input', () => {
      component.statusName = 'Science Edition';
      fixture.detectChanges();
      expect(component.statusName).toBe('Science Edition');
    });
  });
});

