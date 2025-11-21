import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ImpactAreasComponent } from './impact-areas.component';
import { ServiceLocatorService } from '@shared/services/service-locator.service';
import { signal } from '@angular/core';
import { ResultImpactArea, ImpactAreasBody, BaseService } from '@shared/interfaces/impact-area.interface';

describe('ImpactAreasComponent', () => {
  let component: ImpactAreasComponent;
  let fixture: ComponentFixture<ImpactAreasComponent>;
  let serviceLocatorMock: jest.Mocked<ServiceLocatorService>;
  let mockImpactAreasService: jest.Mocked<BaseService>;

  beforeEach(async () => {
    mockImpactAreasService = {
      list: signal([
        { id: 1, name: 'Impact Area 1', icon: 'icon1.png' },
        { id: 2, name: 'Impact Area 2', icon: 'icon2.png' }
      ]),
      loading: signal(false),
      isOpenSearch: signal(false)
    } as any;

    serviceLocatorMock = {
      getService: jest.fn().mockReturnValue(mockImpactAreasService)
    } as any;

    await TestBed.configureTestingModule({
      imports: [ImpactAreasComponent, HttpClientTestingModule],
      providers: [
        { provide: ServiceLocatorService, useValue: serviceLocatorMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImpactAreasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input properties', () => {
    it('should have default body signal', () => {
      expect(component.body).toBeDefined();
      expect(component.body()).toEqual({});
    });

    it('should accept body input', () => {
      const newBody: ImpactAreasBody = {
        result_impact_areas: [
          {
            impact_area_id: 1,
            impact_area_score_id: 2,
            global_target_id: 3
          }
        ]
      };
      component.body = signal(newBody);
      fixture.detectChanges();
      expect(component.body()).toEqual(newBody);
    });

    it('should have default disabled as false', () => {
      expect(component.disabled).toBe(false);
    });

    it('should accept disabled input', () => {
      component.disabled = true;
      fixture.detectChanges();
      expect(component.disabled).toBe(true);
    });
  });

  describe('isGlobalTargetRequired', () => {
    it('should return true when score is 3', () => {
      const body: ImpactAreasBody = {
        result_impact_areas: [
          {
            impact_area_id: 1,
            impact_area_score_id: 3,
            global_target_id: null
          }
        ]
      };
      component.body.set(body);
      expect(component.isGlobalTargetRequired(1)).toBe(true);
    });

    it('should return false when score is not 3', () => {
      const body: ImpactAreasBody = {
        result_impact_areas: [
          {
            impact_area_id: 1,
            impact_area_score_id: 2,
            global_target_id: null
          }
        ]
      };
      component.body.set(body);
      expect(component.isGlobalTargetRequired(1)).toBe(false);
    });

    it('should return false when impact area not found', () => {
      component.body.set({});
      expect(component.isGlobalTargetRequired(999)).toBe(false);
    });

    it('should return false when score is undefined', () => {
      const body: ImpactAreasBody = {
        result_impact_areas: [
          {
            impact_area_id: 1,
            impact_area_score_id: undefined as any,
            global_target_id: null
          }
        ]
      };
      component.body.set(body);
      expect(component.isGlobalTargetRequired(1)).toBe(false);
    });
  });

  describe('getImpactAreaScore', () => {
    it('should return signal for impact area score', () => {
      const scoreSignal = component.getImpactAreaScore(1);
      expect(scoreSignal).toBeDefined();
      expect(scoreSignal().score).toBeNull();
    });

    it('should return existing signal if already created', () => {
      const signal1 = component.getImpactAreaScore(1);
      const signal2 = component.getImpactAreaScore(1);
      expect(signal1).toBe(signal2);
    });

    it('should initialize signal with existing value from body', fakeAsync(() => {
      const body: ImpactAreasBody = {
        result_impact_areas: [
          {
            impact_area_id: 1,
            impact_area_score_id: 5,
            global_target_id: null
          }
        ]
      };
      component.body.set(body);
      tick();
      flush();
      fixture.detectChanges();
      
      const scoreSignal = component.getImpactAreaScore(1);
      expect(scoreSignal().score).toBe(5);
    }));
  });

  describe('getImpactAreaGlobalTarget', () => {
    it('should return signal for global target', () => {
      const targetSignal = component.getImpactAreaGlobalTarget(1);
      expect(targetSignal).toBeDefined();
      expect(targetSignal().global_target_id).toBeNull();
    });

    it('should return existing signal if already created', () => {
      const signal1 = component.getImpactAreaGlobalTarget(1);
      const signal2 = component.getImpactAreaGlobalTarget(1);
      expect(signal1).toBe(signal2);
    });

    it('should initialize signal with existing value from body', fakeAsync(() => {
      const body: ImpactAreasBody = {
        result_impact_areas: [
          {
            impact_area_id: 1,
            impact_area_score_id: null,
            global_target_id: 10
          }
        ]
      };
      component.body.set(body);
      tick();
      flush();
      fixture.detectChanges();
      
      const targetSignal = component.getImpactAreaGlobalTarget(1);
      expect(targetSignal().global_target_id).toBe(10);
    }));
  });

  describe('onScoreChange', () => {
    it('should create new impact area if not exists', () => {
      component.body.set({});
      component.onScoreChange(1, 2);
      
      const body = component.body();
      expect(body.result_impact_areas).toBeDefined();
      expect(body.result_impact_areas?.length).toBe(1);
      expect(body.result_impact_areas?.[0].impact_area_id).toBe(1);
      expect(body.result_impact_areas?.[0].impact_area_score_id).toBe(2);
    });

    it('should update existing impact area score', () => {
      const body: ImpactAreasBody = {
        result_impact_areas: [
          {
            impact_area_id: 1,
            impact_area_score_id: 2,
            global_target_id: null
          }
        ]
      };
      component.body.set(body);
      component.onScoreChange(1, 5);
      
      const updatedBody = component.body();
      expect(updatedBody.result_impact_areas?.[0].impact_area_score_id).toBe(5);
    });

    it('should update score signal', () => {
      component.body.set({});
      component.onScoreChange(1, 3);
      
      const scoreSignal = component.getImpactAreaScore(1);
      expect(scoreSignal().score).toBe(3);
    });

    it('should initialize result_impact_areas if undefined', () => {
      component.body.set({ result_impact_areas: undefined as any });
      component.onScoreChange(1, 2);
      
      const body = component.body();
      expect(body.result_impact_areas).toBeDefined();
      expect(body.result_impact_areas?.length).toBe(1);
    });
  });

  describe('onGlobalTargetChange', () => {
    it('should create new impact area if not exists', () => {
      component.body.set({});
      component.onGlobalTargetChange(1, 10);
      
      const body = component.body();
      expect(body.result_impact_areas).toBeDefined();
      expect(body.result_impact_areas?.length).toBe(1);
      expect(body.result_impact_areas?.[0].impact_area_id).toBe(1);
      expect(body.result_impact_areas?.[0].global_target_id).toBe(10);
    });

    it('should update existing impact area global target', () => {
      const body: ImpactAreasBody = {
        result_impact_areas: [
          {
            impact_area_id: 1,
            impact_area_score_id: null,
            global_target_id: 5
          }
        ]
      };
      component.body.set(body);
      component.onGlobalTargetChange(1, 15);
      
      const updatedBody = component.body();
      expect(updatedBody.result_impact_areas?.[0].global_target_id).toBe(15);
    });

    it('should update global target signal', () => {
      component.body.set({});
      component.onGlobalTargetChange(1, 20);
      
      const targetSignal = component.getImpactAreaGlobalTarget(1);
      expect(targetSignal().global_target_id).toBe(20);
    });

    it('should initialize result_impact_areas if undefined', () => {
      component.body.set({ result_impact_areas: undefined as any });
      component.onGlobalTargetChange(1, 10);
      
      const body = component.body();
      expect(body.result_impact_areas).toBeDefined();
      expect(body.result_impact_areas?.length).toBe(1);
    });
  });

  describe('constructor effect', () => {
    it('should sync body with signals on initialization', fakeAsync(() => {
      const body: ImpactAreasBody = {
        result_impact_areas: [
          {
            impact_area_id: 1,
            impact_area_score_id: 5,
            global_target_id: 10
          },
          {
            impact_area_id: 2,
            impact_area_score_id: 3,
            global_target_id: null
          }
        ]
      };

      component.body.set(body);
      tick();
      flush();
      fixture.detectChanges();

      const scoreSignal1 = component.getImpactAreaScore(1);
      const targetSignal1 = component.getImpactAreaGlobalTarget(1);
      const scoreSignal2 = component.getImpactAreaScore(2);
      const targetSignal2 = component.getImpactAreaGlobalTarget(2);

      expect(scoreSignal1().score).toBe(5);
      expect(targetSignal1().global_target_id).toBe(10);
      expect(scoreSignal2().score).toBe(3);
      expect(targetSignal2().global_target_id).toBeNull();
    }));

    it('should handle null values in body', fakeAsync(() => {
      const body: ImpactAreasBody = {
        result_impact_areas: [
          {
            impact_area_id: 1,
            impact_area_score_id: null,
            global_target_id: null
          }
        ]
      };

      component.body.set(body);
      tick();
      flush();
      fixture.detectChanges();

      const scoreSignal = component.getImpactAreaScore(1);
      const targetSignal = component.getImpactAreaGlobalTarget(1);

      expect(scoreSignal().score).toBeNull();
      expect(targetSignal().global_target_id).toBeNull();
    }));

    it('should handle undefined values in body', fakeAsync(() => {
      const body: ImpactAreasBody = {
        result_impact_areas: [
          {
            impact_area_id: 1,
            impact_area_score_id: undefined as any,
            global_target_id: undefined as any
          }
        ]
      };

      component.body.set(body);
      tick();
      flush();
      fixture.detectChanges();

      const scoreSignal = component.getImpactAreaScore(1);
      const targetSignal = component.getImpactAreaGlobalTarget(1);

      expect(scoreSignal().score).toBeNull();
      expect(targetSignal().global_target_id).toBeNull();
    }));

    it('should handle body without result_impact_areas', fakeAsync(() => {
      component.body.set({});
      tick();
      flush();
      fixture.detectChanges();

      // Should not throw error
      expect(component.body()).toEqual({});
    }));

    it('should handle impact area without areaId', fakeAsync(() => {
      const body: ImpactAreasBody = {
        result_impact_areas: [
          {
            impact_area_id: undefined as any,
            impact_area_score_id: 5,
            global_target_id: 10
          }
        ]
      };

      component.body.set(body);
      tick();
      flush();
      fixture.detectChanges();

      // Should not create signals for undefined areaId
      expect(component.body().result_impact_areas?.length).toBe(1);
    }));

    it('should handle multiple impact areas in effect', fakeAsync(() => {
      const body: ImpactAreasBody = {
        result_impact_areas: [
          {
            impact_area_id: 1,
            impact_area_score_id: 2,
            global_target_id: 5
          },
          {
            impact_area_id: 2,
            impact_area_score_id: 3,
            global_target_id: 10
          },
          {
            impact_area_id: 3,
            impact_area_score_id: 4,
            global_target_id: 15
          }
        ]
      };

      component.body.set(body);
      tick();
      flush();
      fixture.detectChanges();

      const scoreSignal1 = component.getImpactAreaScore(1);
      const targetSignal1 = component.getImpactAreaGlobalTarget(1);
      const scoreSignal2 = component.getImpactAreaScore(2);
      const targetSignal2 = component.getImpactAreaGlobalTarget(2);
      const scoreSignal3 = component.getImpactAreaScore(3);
      const targetSignal3 = component.getImpactAreaGlobalTarget(3);

      expect(scoreSignal1().score).toBe(2);
      expect(targetSignal1().global_target_id).toBe(5);
      expect(scoreSignal2().score).toBe(3);
      expect(targetSignal2().global_target_id).toBe(10);
      expect(scoreSignal3().score).toBe(4);
      expect(targetSignal3().global_target_id).toBe(15);
    }));
  });

  describe('private methods', () => {
    it('should ensure global target signal creates new signal if not exists', () => {
      const signal = component.getImpactAreaGlobalTarget(999);
      expect(signal).toBeDefined();
      expect(signal().global_target_id).toBeNull();
    });

    it('should ensure impact area score signal creates new signal if not exists', () => {
      const signal = component.getImpactAreaScore(999);
      expect(signal).toBeDefined();
      expect(signal().score).toBeNull();
    });

    it('should update global target signal correctly', () => {
      component.onGlobalTargetChange(1, 25);
      const signal = component.getImpactAreaGlobalTarget(1);
      expect(signal().global_target_id).toBe(25);
    });

    it('should update impact area score signal correctly', () => {
      component.onScoreChange(1, 7);
      const signal = component.getImpactAreaScore(1);
      expect(signal().score).toBe(7);
    });

    it('should handle null value in updateGlobalTargetSignal', () => {
      component.onGlobalTargetChange(1, 10);
      component.onGlobalTargetChange(1, null as any);
      const signal = component.getImpactAreaGlobalTarget(1);
      expect(signal().global_target_id).toBeNull();
    });

    it('should handle null value in updateImpactAreaScoreSignal', () => {
      component.onScoreChange(1, 5);
      component.onScoreChange(1, null as any);
      const signal = component.getImpactAreaScore(1);
      expect(signal().score).toBeNull();
    });

    it('should reuse existing global target signal if already created', () => {
      const signal1 = component.getImpactAreaGlobalTarget(1);
      const signal2 = component.getImpactAreaGlobalTarget(1);
      expect(signal1).toBe(signal2);
    });

    it('should reuse existing impact area score signal if already created', () => {
      const signal1 = component.getImpactAreaScore(1);
      const signal2 = component.getImpactAreaScore(1);
      expect(signal1).toBe(signal2);
    });
  });

  describe('onScoreChange edge cases', () => {
    it('should handle updating score when impact area already exists with other fields', () => {
      const body: ImpactAreasBody = {
        result_impact_areas: [
          {
            impact_area_id: 1,
            impact_area_score_id: 2,
            global_target_id: 10
          }
        ]
      };
      component.body.set(body);
      component.onScoreChange(1, 4);
      
      const updatedBody = component.body();
      expect(updatedBody.result_impact_areas?.[0].impact_area_score_id).toBe(4);
      expect(updatedBody.result_impact_areas?.[0].global_target_id).toBe(10); // Should preserve
    });
  });

  describe('onGlobalTargetChange edge cases', () => {
    it('should handle updating global target when impact area already exists with other fields', () => {
      const body: ImpactAreasBody = {
        result_impact_areas: [
          {
            impact_area_id: 1,
            impact_area_score_id: 3,
            global_target_id: 5
          }
        ]
      };
      component.body.set(body);
      component.onGlobalTargetChange(1, 15);
      
      const updatedBody = component.body();
      expect(updatedBody.result_impact_areas?.[0].global_target_id).toBe(15);
      expect(updatedBody.result_impact_areas?.[0].impact_area_score_id).toBe(3); // Should preserve
    });
  });
});

