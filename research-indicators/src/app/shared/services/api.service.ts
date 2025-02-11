import { Injectable, WritableSignal, inject } from '@angular/core';
import { ToPromiseService } from './to-promise.service';
import { LoginRes, MainResponse } from '../interfaces/responses.interface';
import { GetViewComponents, Indicator, IndicatorTypes } from '../interfaces/api.interface';
import { GeneralInformation } from '@interfaces/result/general-information.interface';
import { GetContracts } from '../interfaces/get-contracts.interface';
import { Result, ResultConfig, ResultFilter } from '../interfaces/result/result.interface';
import { GetInstitution } from '../interfaces/get-institutions.interface';
import { PatchResultEvidences } from '../interfaces/patch-result-evidences.interface';
import { GetLevers } from '../interfaces/get-levers.interface';
import { PatchAllianceAlignment } from '../interfaces/alliance-aligment.interface';
import { PatchPartners } from '../interfaces/patch-partners.interface';
import { Degree, Gender, GetCapSharing, Length, SessionFormat, SessionType } from '../interfaces/get-cap-sharing.interface';
import { CacheService } from './cache/cache.service';
import { GetAllianceAlignment } from '../interfaces/get-alliance-alignment.interface';
import { GetMetadata } from '../interfaces/get-metadata.interface';
import { UserStaff } from '../interfaces/get-user-staff.interface';
import { GetCountries } from '../interfaces/get-countries.interface';
import { GetDeliveryModality } from '../interfaces/get-delivery-modality.interface';
import { GetLanguages } from '../interfaces/get-get-languages.interface';
import { SessionPurpose } from '../interfaces/get-session-purpose.interface';
import { GetPolicyChange } from '../interfaces/get-get-policy-change.interface';
import { GetResultsByContract } from '../interfaces/get-results-by-contract.interface';
import { GetProjectDetail } from '../interfaces/get-project-detail.interface';
import { GetGeoLocation } from '../interfaces/get-geo-location.interface';
import { GetIndicatorsResultsAmount } from '../interfaces/get-indicators-results-amount.interface';
import { GetResultsStatus } from '../interfaces/get-results-status.interface';
import { GetRegion } from '../interfaces/get-region.interface';
import { LatestResult } from '@pages/platform/pages/home/components/my-latest-results/my-latest-results.component';
import { GetGeoSearch } from '../interfaces/get-geo-search.interface';
import { GetOsCountries } from '../interfaces/get-os-countries.interface';
import { GetOsResult } from '@shared/interfaces/get-os-result.interface';
import { environment } from '../../../environments/environment';
import { PostError } from '../interfaces/post-error.interface';
import { GetContractsByUser } from '@shared/interfaces/get-contracts-by-user.interface';
import { GetOsSubNationals, OpenSearchFilters } from '../interfaces/get-os-subnational.interface';
import { GetAnnouncementSettingAvailable } from '../interfaces/get-announcement-setting-available.interface';
import { GetAllIndicators } from '../interfaces/get-all-indicators.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  TP = inject(ToPromiseService);
  cache = inject(CacheService);
  //? >>>>>>>>>>>> Endpoints <<<<<<<<<<<<<<<<<
  login = (awsToken: string): Promise<MainResponse<LoginRes>> => {
    const url = () => `authorization/login`;
    return this.TP.post(url(), {}, { token: awsToken, isAuth: true });
  };

  refreshToken = (refreshToken: string): Promise<MainResponse<LoginRes>> => {
    const url = () => `authorization/refresh-token`;
    return this.TP.post(url(), {}, { token: refreshToken, isRefreshToken: true, isAuth: true });
  };

  GET_IndicatorTypes = (): Promise<MainResponse<IndicatorTypes[]>> => {
    const url = () => `indicator-types`;
    return this.TP.get(url(), {});
  };

  GET_AllIndicators = (): Promise<MainResponse<GetAllIndicators[]>> => {
    const url = () => `indicators`;
    return this.TP.get(url(), {});
  };

  GET_Contracts = (): Promise<MainResponse<GetContracts[]>> => {
    const url = () => `agresso/contracts`;
    return this.TP.get(url(), {});
  };

  // GET_InnoDevOutput = (): Promise<MainResponse<GetInnoDevOutput[]>> => {
  //   const url = () => `results?indicator-codes=2`;
  //   return this.TP.get(url(), {});
  // };

  // GET_InnoUseOutput = (): Promise<MainResponse<GetInnoUseOutput[]>> => {
  //   const url = () => `results?indicator-codes=6`;
  //   return this.TP.get(url(), {});
  // };

  GET_Institutions = (): Promise<MainResponse<GetInstitution[]>> => {
    const url = () => `tools/clarisa/institutions?location=true&type=true&only-hq=true`;
    return this.TP.get(url(), {});
  };

  GET_IndicatorTypeById = (id: number): Promise<MainResponse<Indicator>> => {
    const url = () => `indicator-types/${id}`;
    return this.TP.get(url(), {});
  };

  GET_IndicatorById = (id: number): Promise<MainResponse<Indicator>> => {
    const url = () => `indicators/${id}`;
    return this.TP.get(url(), {});
  };

  GET_ViewComponents = (): Promise<MainResponse<GetViewComponents[]>> => {
    const url = () => `authorization/view/scomponents`;
    return this.TP.get(url(), {});
  };

  GET_Results = (resultFilter: ResultFilter, resultConfig?: ResultConfig): Promise<MainResponse<Result[]>> => {
    const { indicatorsCodes, userCodes } = resultFilter;
    const queryParams: string[] = [];

    // Dynamic handling of boolean config parameters
    if (resultConfig) {
      Object.entries(resultConfig).forEach(([key, value]) => {
        if (value) {
          queryParams.push(`${key}=true`);
        }
      });
    }

    if (indicatorsCodes?.length) {
      queryParams.push(`indicator-codes=${indicatorsCodes.join(',')}`);
    }

    if (userCodes?.length) {
      queryParams.push(`create-user-codes=${userCodes.join(',')}`);
    }

    const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';

    const url = () => `results${queryString}`;
    return this.TP.get(url(), {});
  };

  // create result
  POST_Result = <T>(body: T): Promise<MainResponse<Result>> => {
    const url = () => `results`;
    return this.TP.post(url(), body, {});
  };

  GET_UserStaff = (): Promise<MainResponse<UserStaff[]>> => {
    const url = () => `agresso/staff`;
    return this.TP.get(url(), {});
  };

  GET_GeneralInformation = (id: number): Promise<MainResponse<GeneralInformation>> => {
    const url = () => `results/${id}/general-information`;
    return this.TP.get(url(), { loadingTrigger: true });
  };

  PATCH_GeneralInformation = <T>(id: number, body: T): Promise<MainResponse<GeneralInformation>> => {
    const url = () => `results/${id}/general-information`;
    return this.TP.patch(url(), body);
  };

  GET_Partners = (id: number): Promise<MainResponse<PatchPartners>> => {
    const url = () => `results/institutions/by-result-id/${id}?role=partners`;
    return this.TP.get(url(), { loadingTrigger: true });
  };

  PATCH_Partners = <T>(id: number, body: T): Promise<MainResponse<GeneralInformation>> => {
    const url = () => `results/institutions/partners/by-result-id/${id}`;
    return this.TP.patch(url(), body);
  };

  GET_ResultEvidences = (resultId: number): Promise<MainResponse<PatchResultEvidences>> => {
    const url = () => `results/evidences/principal/${resultId}`;
    return this.TP.get(url(), { loadingTrigger: true });
  };

  PATCH_ResultEvidences = <T>(resultId: number, body: T): Promise<MainResponse<PatchResultEvidences>> => {
    const url = () => `results/evidences/by-result-id/${resultId}`;
    return this.TP.patch(url(), body);
  };

  GET_Levers = (): Promise<MainResponse<GetLevers[]>> => {
    const url = () => `tools/clarisa/levers`;
    return this.TP.get(url(), {});
  };

  GET_CapacitySharing = (): Promise<MainResponse<GetCapSharing>> => {
    const url = () => `results/capacity-sharing/by-result-id/${this.cache.currentResultId()}`;
    return this.TP.get(url(), { loadingTrigger: true });
  };

  PATCH_CapacitySharing = <T>(body: T): Promise<MainResponse<GetCapSharing>> => {
    const url = () => `results/capacity-sharing/by-result-id/${this.cache.currentResultId()}`;
    return this.TP.patch(url(), body);
  };

  GET_PolicyChange = (id: number): Promise<MainResponse<GetPolicyChange>> => {
    const url = () => `results/policy-change/by-result-id/${id}`;
    return this.TP.get(url(), { loadingTrigger: true });
  };

  PATCH_PolicyChange = <T>(id: number, body: T): Promise<MainResponse<GetPolicyChange>> => {
    const url = () => `results/policy-change/by-result-id/${id}`;
    return this.TP.patch(url(), body);
  };

  GET_Alignments = (id: number): Promise<MainResponse<GetAllianceAlignment>> => {
    const url = () => `results/${id}/alignments`;
    return this.TP.get(url(), { loadingTrigger: true });
  };

  PATCH_Alignments = <T>(id: number, body: T): Promise<MainResponse<PatchAllianceAlignment>> => {
    const url = () => `results/${id}/alignments`;
    return this.TP.patch(url(), body);
  };

  GET_SessionFormat = (): Promise<MainResponse<SessionFormat[]>> => {
    const url = () => `session/format`;
    return this.TP.get(url(), {});
  };

  GET_SessionType = (): Promise<MainResponse<SessionType[]>> => {
    const url = () => `session/type`;
    return this.TP.get(url(), {});
  };

  GET_Degrees = (): Promise<MainResponse<Degree[]>> => {
    const url = () => `degree`;
    return this.TP.get(url(), {});
  };

  GET_SessionLength = (): Promise<MainResponse<Length[]>> => {
    const url = () => `session/length`;
    return this.TP.get(url(), {});
  };

  GET_Gender = (): Promise<MainResponse<Gender[]>> => {
    const url = () => `gender`;
    return this.TP.get(url(), {});
  };

  GET_Metadata = (id: number): Promise<MainResponse<GetMetadata>> => {
    const url = () => `results/${id}/metadata`;
    return this.TP.get(url(), {});
  };

  GET_Countries = (): Promise<MainResponse<GetCountries[]>> => {
    const url = () => `tools/clarisa/countries`;
    return this.TP.get(url(), {});
  };

  GET_DeliveryModalities = (): Promise<MainResponse<GetDeliveryModality[]>> => {
    const url = () => `delivery-modalities`;
    return this.TP.get(url(), {});
  };

  GET_Languages = (): Promise<MainResponse<GetLanguages[]>> => {
    const url = () => `tools/clarisa/languages`;
    return this.TP.get(url(), {});
  };

  GET_SessionPurpose = (): Promise<MainResponse<SessionPurpose[]>> => {
    const url = () => `session/purpose`;
    return this.TP.get(url(), {});
  };

  GET_ContractsByUser = (): Promise<MainResponse<GetContractsByUser[]>> => {
    const url = () => 'agresso/contracts/results/current-user';
    return this.TP.get(url(), {});
  };

  GET_ResultsCount = (agreementId: string): Promise<MainResponse<GetProjectDetail>> => {
    const url = () => `agresso/contracts/${agreementId}/results/count`;
    return this.TP.get(url(), {});
  };

  GET_ResultsByContractId = (contractId: string): Promise<MainResponse<GetResultsByContract[]>> => {
    const url = () => `results/contracts/${contractId}`;
    return this.TP.get(url(), {});
  };

  GET_ResultsStatus = (): Promise<MainResponse<GetResultsStatus[]>> => {
    const url = () => `results/status/result-amount/current-user`;
    return this.TP.get(url(), {});
  };

  GET_IndicatorsResultsAmount = (): Promise<MainResponse<GetIndicatorsResultsAmount[]>> => {
    const url = () => `indicators/results-amount/current-user`;
    return this.TP.get(url(), {});
  };

  GET_LatestResults = (): Promise<MainResponse<LatestResult[]>> => {
    const url = () => `results/last-updated/current-user?limit=3`;
    return this.TP.get(url(), {});
  };

  GET_GeoLocation = (id: number): Promise<MainResponse<GetGeoLocation>> => {
    const url = () => `results/${id}/geo-location`;
    return this.TP.get(url(), { loadingTrigger: true });
  };

  PATCH_GeoLocation = <T>(id: number, body: T): Promise<MainResponse<GetGeoLocation>> => {
    const url = () => `results/${id}/geo-location`;
    return this.TP.patch(url(), body);
  };

  GET_Regions = (): Promise<MainResponse<GetRegion[]>> => {
    const url = () => `tools/clarisa/regions`;
    return this.TP.get(url(), {});
  };

  // GET_GeoScope = (): Promise<MainResponse<any[]>> => {
  //   const url = () => `tools/clarisa/geo-scope`;
  //   return this.TP.get(url(), {});
  // };

  GET_GeoSearch = (scope: string, search: string): Promise<MainResponse<GetGeoSearch[]>> => {
    const url = () => `tools/clarisa/manager/opensearch/${scope}/search?query=${search}`;
    return this.TP.get(url(), {});
  };

  GET_OpenSearchCountries = (search: string): Promise<MainResponse<GetOsCountries[]>> => {
    const url = () => `tools/clarisa/manager/opensearch/countries/search?query=${search}`;
    return this.TP.get(url(), {});
  };

  GET_OpenSearchSubNationals = (search: string, openSearchFilters?: OpenSearchFilters): Promise<MainResponse<GetOsSubNationals[]>> => {
    const { country } = openSearchFilters || {};
    const countryQuery = country ? `&country=${country}` : '';
    const url = () => `tools/clarisa/manager/opensearch/subnational/search?query=${search}${countryQuery}`;
    return this.TP.get(url(), {});
  };

  GET_OpenSearchResult = (search: string, sampleSize: number): Promise<MainResponse<GetOsResult[]>> => {
    const url = () => `opensearch/result/search?query=${search}&sample-size=${sampleSize}`;
    return this.TP.get(url(), {});
  };

  GET_AnnouncementSettingAvailable = (): Promise<MainResponse<GetAnnouncementSettingAvailable[]>> => {
    const url = () => `announcement-setting/available`;
    return this.TP.get(url(), {});
  };

  // Add the saveErrors endpoint
  saveErrors = (error: PostError): Promise<MainResponse<PostError>> => {
    const url = () => '';
    return this.TP.post(url(), { error }, { isAuth: environment.saveErrorsUrl });
  };

  //? >>>>>>>>>>>> Utils <<<<<<<<<<<<<<<<<

  cleanBody(body: Record<string, unknown>) {
    for (const key in body) {
      if (typeof body[key] === 'string') {
        body[key] = '';
      } else if (typeof body[key] === 'number') {
        body[key] = null;
      } else if (Array.isArray(body[key])) {
        body[key] = [];
      } else {
        body[key] = null;
      }
    }
  }

  updateSignalBody(body: WritableSignal<Record<string, unknown>>, newBody: Record<string, unknown>) {
    for (const key in newBody) {
      if (newBody[key] !== null) {
        body.update(prev => ({ ...prev, [key]: newBody[key] }));
      }
    }
  }
}
