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
  
  private readonly globalTargetSignals = new Map<number, WritableSignal<{ global_target_id: number | null }>>();

  constructor() {
    effect(() => {
      const body = this.body();
      
      if (body.result_impact_areas) {
        for (const impactArea of body.result_impact_areas) {
          const globalTargetId = impactArea.global_target_id;
          const areaId = impactArea.impact_area_id;
          
          if (areaId) {
            const targetSignal = this.ensureGlobalTargetSignal(areaId);
            targetSignal.set({ global_target_id: globalTargetId ?? null });
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

  getImpactAreaGlobalTarget(areaId: number): WritableSignal<{ global_target_id: number | null }> {
    return this.ensureGlobalTargetSignal(areaId);
  }

  onScoreChange(areaId: number, value: number) {
    const currentBody = this.body();
    currentBody.result_impact_areas ??= [];
    let impactArea = currentBody.result_impact_areas.find((ia: ResultImpactArea) => ia.impact_area_id === areaId);
    if (impactArea === undefined) {
      impactArea = {
        impact_area_id: areaId,
        impact_area_score_id: value,
        global_target_id: undefined,
      };
      currentBody.result_impact_areas.push(impactArea);
    } else {
      impactArea.impact_area_score_id = value;
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
        global_target_id: undefined,
        impact_area_score_id: undefined,
      };
      currentBody.result_impact_areas.push(impactArea);
    }
    
    impactArea.global_target_id = value;
    this.updateGlobalTargetSignal(areaId, value);
    
    this.body.set({ ...currentBody });
  }

  private ensureGlobalTargetSignal(areaId: number): WritableSignal<{ global_target_id: number | null }> {
    if (!this.globalTargetSignals.has(areaId)) {
      const impactArea = this.body().result_impact_areas?.find((ia: ResultImpactArea) => ia.impact_area_id === areaId);
      const initialValue = impactArea?.global_target_id ?? null;
      const newSignal = signal({ global_target_id: initialValue });
      this.globalTargetSignals.set(areaId, newSignal);
    }

    return this.globalTargetSignals.get(areaId)!;
  }

  private updateGlobalTargetSignal(areaId: number, targetId: number | null) {
    const targetSignal = this.ensureGlobalTargetSignal(areaId);
    targetSignal.set({ global_target_id: targetId });
  }
}
