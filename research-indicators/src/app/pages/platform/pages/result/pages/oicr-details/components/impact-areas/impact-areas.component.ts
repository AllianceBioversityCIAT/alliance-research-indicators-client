import { NgTemplateOutlet } from '@angular/common';
import { Component, Input, signal, WritableSignal, inject } from '@angular/core';
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

  isGlobalTargetRequired(areaId: number): boolean {
    const impactArea = this.body().result_impact_areas?.find((ia: ResultImpactArea) => ia.impact_area_id === areaId);
    const score = impactArea?.impact_area_score_id;
    return score === 2;
  }

  getImpactAreaScore(areaId: number): WritableSignal<{ score: number | null }> {
    const impactArea = this.body().result_impact_areas?.find((ia: ResultImpactArea) => ia.impact_area_id === areaId);
    return signal({ score: impactArea?.impact_area_score_id || null });
  }

  getImpactAreaGlobalTarget(areaId: number): WritableSignal<{ global_target: number | null }> {
    const impactArea = this.body().result_impact_areas?.find((ia: ResultImpactArea) => ia.impact_area_id === areaId);
    const globalTarget = impactArea?.result_impact_area_global_targets?.[0];
    return signal({ global_target: globalTarget?.global_target_id || null });
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
