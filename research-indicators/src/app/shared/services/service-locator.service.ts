import { Injectable, Injector } from '@angular/core';
import { GetContractsService } from './control-list/get-contracts.service';
import { GetLeversService } from './control-list/get-levers.service';
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

@Injectable({
  providedIn: 'root'
})
export class ServiceLocatorService {
  constructor(private injector: Injector) {}

  getService(serviceName: ControlListServices) {
    switch (serviceName) {
      case 'contracts':
        return this.injector.get(GetContractsService);
      case 'levers':
        return this.injector.get(GetLeversService);
      case 'institutions':
        return this.injector.get(GetInstitutionsService);
      case 'userStaff':
        return this.injector.get(GetUserStaffService);
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
      case 'capSharingDeliveryModalities':
        return this.injector.get(CapSharingDeliveryModalitiesService);
      case 'capSharingSessionPurpose':
        return this.injector.get(CapSharingSessionPurposeService);
      case 'yesOrNo':
        return this.injector.get(YesOrNotService);
      case 'policyTypes':
        return this.injector.get(PolicyTypesService);
      case 'policyStages':
        return this.injector.get(PolicyStagesService);
      case 'geoFocus':
        return this.injector.get(GetGeoFocusService);
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
      case 'openSearchSubNationals':
        return this.injector.get(GetOsSubnationalService);
      default:
        console.warn(`Service ${serviceName} not found`);
        return null;
    }
  }
}
