import { NgTemplateOutlet } from '@angular/common';
import { Component, Input, signal, WritableSignal, inject, effect } from '@angular/core';
import { RadioButtonComponent } from '@shared/components/custom-fields/radio-button/radio-button.component';
import { SelectComponent } from '@shared/components/custom-fields/select/select.component';
import { ServiceLocatorService } from '@shared/services/service-locator.service';
import { ResultImpactArea, ImpactAreasBody, BaseService } from '@shared/interfaces/impact-area.interface';

@Component({
  selector: 'app-impact-areas',
  standalone: true,
  imports: [RadioButtonComponent, SelectComponent, NgTemplateOutlet],
  templateUrl: './impact-areas.component.html'
})
export class ImpactAreasComponent {
  @Input() body: WritableSignal<ImpactAreasBody> = signal({});
  @Input() disabled = false;

  serviceLocator = inject(ServiceLocatorService);
  impactAreasService = this.serviceLocator.getService('impactAreas') as BaseService;
  
  private globalTargetSignals = new Map<number, WritableSignal<{ global_target: number | null }>>();

  constructor() {
    effect(() => {
      const body = this.body();
      
      if (body.result_impact_areas) {
        for (const impactArea of body.result_impact_areas) {
          const globalTargetId = (impactArea as any).global_target;
          const areaId = impactArea.impact_area_id;
          
          if (areaId) {
            let targetSignal = this.globalTargetSignals.get(areaId);
            if (!targetSignal) {
              targetSignal = signal({ global_target: null });
              this.globalTargetSignals.set(areaId, targetSignal);
            }
            targetSignal.set({ global_target: globalTargetId ?? null });
          }
        }
      }
    });
  }

  isGlobalTargetRequired(areaId: number): boolean {
    const impactArea = this.body().result_impact_areas?.find((ia: ResultImpactArea) => ia.impact_area_id === areaId);
    const score = impactArea?.impact_area_score_id;
    return score === 3;
  }

  getImpactAreaScore(areaId: number): WritableSignal<{ score: number | null }> {
    const impactArea = this.body().result_impact_areas?.find((ia: ResultImpactArea) => ia.impact_area_id === areaId);
    return signal({ score: impactArea?.impact_area_score_id || null });
  }

  getImpactAreaGlobalTarget(areaId: number): WritableSignal<{ global_target: number | null }> {
    if (!this.globalTargetSignals.has(areaId)) {
      const impactArea = this.body().result_impact_areas?.find((ia: ResultImpactArea) => ia.impact_area_id === areaId);
      const globalTarget = impactArea?.result_impact_area_global_targets?.[0];
      const globalTargetId = (impactArea as any)?.global_target || globalTarget?.global_target_id || null;
      const newSignal = signal({ global_target: globalTargetId });
      this.globalTargetSignals.set(areaId, newSignal);
      return newSignal;
    }
    return this.globalTargetSignals.get(areaId)!;
  }

  onScoreChange(areaId: number, value: number) {
    const currentBody = this.body();
    currentBody.result_impact_areas ??= [];
    
    let impactArea = currentBody.result_impact_areas.find((ia: ResultImpactArea) => ia.impact_area_id === areaId);
    if (impactArea === undefined) {
      impactArea = {
        impact_area_id: areaId,
        impact_area_score_id: value,
        result_impact_area_global_targets: []
      };
      currentBody.result_impact_areas.push(impactArea);
    } else {
      impactArea.impact_area_score_id = value;
    }
    
    if (value !== 2) {
      impactArea.result_impact_area_global_targets = [];
    }
    
    this.body.set({ ...currentBody });
  }

  onGlobalTargetChange(areaId: number, value: number) {
    const currentBody = this.body();
    currentBody.result_impact_areas ??= [];
    
    let impactArea = currentBody.result_impact_areas.find((ia: ResultImpactArea) => ia.impact_area_id === areaId);
    if (impactArea === undefined) {
      impactArea = {
        impact_area_id: areaId,
        impact_area_score_id: undefined,
        result_impact_area_global_targets: []
      };
      currentBody.result_impact_areas.push(impactArea);
    }
    
    impactArea.result_impact_area_global_targets = [{
      global_target_id: value
    }];
    
    this.body.set({ ...currentBody });
  }
}
