import { Injectable, Injector } from '@angular/core';
import { GetContractsService } from './control-list/get-contracts.service';
import { GetInstitutionsService } from './control-list/get-institutions.service';
import { ControlListServices } from '../interfaces/services.interface';
import { GetUserStaffService } from './control-list/get-user-staff.service';
import { GetCountriesService } from './control-list/get-countries.service';
import { GetClarisaLanguagesService } from './control-list/get-clarisa-languages.service';
import { PolicyTypesService } from './short-control-list/policy-types.service';
import { PolicyStagesService } from './short-control-list/policy-stages.service';
import { CapSharingGendersService } from './short-control-list/cap-sharing-genders.service';
import { CapSharingFormatsService } from './short-control-list/cap-sharing-formats.service';
import { CapSharingTypesService } from './short-control-list/cap-sharing-types.service';
import { CapSharingDegreesService } from './short-control-list/cap-sharing-degrees.service';
import { CapSharingLengthsService } from './short-control-list/cap-sharing-lengths.service';
import { CapSharingDeliveryModalitiesService } from './short-control-list/cap-sharing-delivery-modalities.service';
import { CapSharingSessionPurposeService } from './short-control-list/cap-sharing-session-purpose.service';
import { YesOrNotService } from './short-control-list/yes-or-not.service';
import { GetGeoFocusService } from './control-list/get-geo-focus.service';
import { GetRegionsService } from './control-list/get-regions.service';
import { GetOsGeoScopeService } from './opensearch/get-os-geo-scope.service';
import { GetOsCountriesService } from './opensearch/get-os-countries.service';
import { GetOsResultService } from './opensearch/get-os-result.service';
import { GetInnoDevOutputService } from './control-list/get-innovation-dev-output.service';
import { GetInnoUseOutputService } from './control-list/get-innovation-use-output.service';
import { GetOsSubnationalService } from './opensearch/get-os-subnational.service';
import { GetAllIndicatorsService } from './control-list/get-all-indicators.service';
import { GetAllResultStatusService } from './control-list/get-all-result-status.service';
import { GetAllYearsService } from './control-list/get-all-years.service';
import { GetSubnationalByIsoAlphaService } from './get-subnational-by-iso-alpha.service';
import { GetClarisaInstitutionsTypesChildlessService } from './get-clarisa-institutions-type-childless.service';
import { GetClarisaInstitutionsTypesService } from './get-clarisa-institutions-type.service';
import { IpOwnerService } from './short-control-list/ip-owner.service';
import { GetYearsService } from './control-list/get-years.service';
import { GetYearsByCodeService } from './control-list/get-years-by-code.service';
import { GetInnovationTypesService } from './control-list/get-innovation-types.service';
import { GetInnovationCharacteristicsService } from './control-list/get-innovation-characteristics.service';
import { GetInnovationReadinessLevelsService } from './control-list/get-innovation-readiness-levels.service';
import { GetAnticipatedUsersService } from './short-control-list/get-anticipated-users.service';
import { GetActorTypesService } from './control-list/get-actor-types.service';
import { GetInstitutionTypesService } from './control-list/get-institution-types.service';
import { GetSdgsService } from './control-list/get-sdgs.service';
import { ScalingService } from './short-control-list/scaling.service';
import { DisseminationQualificationsService } from './short-control-list/dissemination-qualifications.service';
import { ToolFunctionsService } from './short-control-list/tool-functions.service';
import { ExpansionPotentialService } from './short-control-list/expansion-potential.service';
import { InnResultsService } from './short-control-list/inn-results.service';
import { ApplicationOptionsService } from './short-control-list/application-options.service';
import { GetLeversService } from './control-list/get-levers.service';
import { GetProjectStatusService } from './control-list/get-project-status.service';
import { GetProjectIndicatorsHierarchyService } from './control-list/get-project-indicators-hierarchy.service';
import { GetInitiativesService } from './control-list/get-initiatives.service';
import { GetTagsService } from './control-list/get-tags.service';
import { OicrResultsService } from './short-control-list/oicr-results.service';
import { GetMaturityLevelsService } from './control-list/get-maturity-levels.service';
import { GetAllianceStaffByGroupService } from './control-list/get-alliance-staff-by-group.service';
import { GetLeverStrategicOutcomesService } from './control-list/get-lever-strategic-outcomes.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceLocatorService {
  constructor(private readonly injector: Injector) {}

  getService(serviceName: ControlListServices) {
    return (
      this.getPrimaryServices(serviceName) ??
      this.getSecondaryServices(serviceName) ??
      this.getTertiaryServices(serviceName) ??
      this.getQuaternaryServices(serviceName) ??
      this.getOtherServices(serviceName)
    );
  }

  clearService(serviceName: ControlListServices) {
    const service = this.getService(serviceName);
    if (service) {
      if (typeof (service as { list?: unknown }).list !== 'undefined') {
        (service as { list: { set: (v: unknown[]) => void } }).list.set([]);
      }
      if (typeof (service as { main?: () => void }).main === 'function') {
        (service as { main: () => void }).main();
      }
    }
  }

  private getPrimaryServices(serviceName: ControlListServices) {
    switch (serviceName) {
      case 'actorTypes':
        return this.injector.get(GetActorTypesService);
      case 'institutionTypes':
        return this.injector.get(GetInstitutionTypesService);
      case 'anticipatedUsers':
        return this.injector.get(GetAnticipatedUsersService);
      case 'innovationTypes':
        return this.injector.get(GetInnovationTypesService);
      case 'innovationCharacteristics':
        return this.injector.get(GetInnovationCharacteristicsService);
      case 'innovationReadinessLevels':
        return this.injector.get(GetInnovationReadinessLevelsService);
      case 'contracts':
        return this.injector.get(GetContractsService);
      case 'institutions':
        return this.injector.get(GetInstitutionsService);
      case 'userStaff':
        return this.injector.get(GetUserStaffService);
      case 'maturityLevels':
        return this.injector.get(GetMaturityLevelsService);
      case 'countriesWithSubnational': {
        const svc = this.injector.get(GetCountriesService);
        svc.main(true);
        return svc;
      }
      case 'countriesWithoutSubnational': {
        const svc = this.injector.get(GetCountriesService);
        svc.main(false);
        return svc;
      }
      default:
        return null;
    }
  }

  private getSecondaryServices(serviceName: ControlListServices) {
    switch (serviceName) {
      case 'countries':
        return this.injector.get(GetCountriesService);
      case 'languages':
        return this.injector.get(GetClarisaLanguagesService);
      case 'capSharingGenders':
        return this.injector.get(CapSharingGendersService);
      case 'capSharingFormats':
        return this.injector.get(CapSharingFormatsService);
      case 'capSharingTypes':
        return this.injector.get(CapSharingTypesService);
      case 'capSharingDegrees':
        return this.injector.get(CapSharingDegreesService);
      case 'capSharingLengths':
        return this.injector.get(CapSharingLengthsService);
      case 'disseminationQualifications':
        return this.injector.get(DisseminationQualificationsService);
      case 'toolFunctions':
        return this.injector.get(ToolFunctionsService);
      case 'initiatives':
        return this.injector.get(GetInitiativesService);
      case 'tags':
        return this.injector.get(GetTagsService);
      case 'oicrResults':
        return this.injector.get(OicrResultsService);
      default:
        return null;
    }
  }

  private getTertiaryServices(serviceName: ControlListServices) {
    switch (serviceName) {
      case 'capSharingDeliveryModalities':
        return this.injector.get(CapSharingDeliveryModalitiesService);
      case 'capSharingSessionPurpose':
        return this.injector.get(CapSharingSessionPurposeService);
      case 'yesOrNo':
        return this.injector.get(YesOrNotService);
      case 'expansionPotential':
        return this.injector.get(ExpansionPotentialService);
      case 'policyTypes':
        return this.injector.get(PolicyTypesService);
      case 'policyStages':
        return this.injector.get(PolicyStagesService);
      case 'geoFocus':
        return this.injector.get(GetGeoFocusService);
      case 'innResults':
        return this.injector.get(InnResultsService);
      default:
        return null;
    }
  }

  private getQuaternaryServices(serviceName: ControlListServices) {
    switch (serviceName) {
      case 'regions':
        return this.injector.get(GetRegionsService);
      case 'geoScopeOpenSearch':
        return this.injector.get(GetOsGeoScopeService);
      case 'openSearchCountries':
        return this.injector.get(GetOsCountriesService);
      case 'openSearchResult':
        return this.injector.get(GetOsResultService);
      case 'innoDevOutput':
        return this.injector.get(GetInnoDevOutputService);
      case 'innoUseOutput':
        return this.injector.get(GetInnoUseOutputService);
      default:
        return null;
    }
  }

  private getOtherServices(serviceName: ControlListServices) {
    switch (serviceName) {
      case 'openSearchSubNationals':
        return this.injector.get(GetOsSubnationalService);
      case 'getAllIndicators':
        return this.injector.get(GetAllIndicatorsService);
      case 'allResultStatus':
        return this.injector.get(GetAllResultStatusService);
      case 'getYears':
        return this.injector.get(GetYearsService);
      case 'getYearsByCode':
        return this.injector.get(GetYearsByCodeService);
      case 'getProjectIndicatorsHierarchy':
        return this.injector.get(GetProjectIndicatorsHierarchyService);
      case 'getAllYears':
        return this.injector.get(GetAllYearsService);
      case 'ipOwners':
        return this.injector.get(IpOwnerService);
      case 'GetSubnationalByIsoAlpha':
        return this.injector.get(GetSubnationalByIsoAlphaService);
      case 'clarisaInstitutionsTypes':
        return this.injector.get(GetClarisaInstitutionsTypesService);
      case 'clarisaInstitutionsTypesChildless':
        return this.injector.get(GetClarisaInstitutionsTypesChildlessService);
      case 'sdgs':
        return this.injector.get(GetSdgsService);
      case 'scaling':
        return this.injector.get(ScalingService);
      case 'applicationOptions':
        return this.injector.get(ApplicationOptionsService);
      case 'levers':
        return this.injector.get(GetLeversService);
      case 'leverStrategicOutcomes':
        return this.injector.get(GetLeverStrategicOutcomesService);
      case 'projectStatus':
        return this.injector.get(GetProjectStatusService);
      case 'allianceStaffByGroup':
        return this.injector.get(GetAllianceStaffByGroupService);
      default:
        console.warn(`Service ${serviceName} not found`);
        return null;
    }
  }
}
