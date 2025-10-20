import { Injectable, WritableSignal, inject } from '@angular/core';
import { ToPromiseService } from './to-promise.service';
import { LoginRes, MainResponse } from '../interfaces/responses.interface';
import { GetViewComponents, Indicator, IndicatorTypes } from '../interfaces/api.interface';
import { GeneralInformation } from '@interfaces/result/general-information.interface';
import { Result, ResultConfig, ResultFilter } from '../interfaces/result/result.interface';
import { GetInstitution } from '../interfaces/get-institutions.interface';
import { PatchResultEvidences } from '../interfaces/patch-result-evidences.interface';
import { PatchAllianceAlignment } from '../interfaces/alliance-aligment.interface';
import { PatchPartners } from '../interfaces/patch-partners.interface';
import { Degree, Gender, GetCapSharing, IpOwners, Length, SessionFormat, SessionType } from '../interfaces/get-cap-sharing.interface';
import { CacheService } from './cache/cache.service';
import { GetAllianceAlignment } from '../interfaces/get-alliance-alignment.interface';
import { GetMetadata } from '../interfaces/get-metadata.interface';
import { UserStaff } from '../interfaces/get-user-staff.interface';
import { GetCountries } from '../interfaces/get-countries.interface';
import { GetDeliveryModality } from '../interfaces/get-delivery-modality.interface';
import { GetLanguages } from '../interfaces/get-get-languages.interface';
import { SessionPurpose } from '../interfaces/get-session-purpose.interface';
import { GetPolicyChange } from '../interfaces/get-get-policy-change.interface';
import { ContactPersonResponse } from '../interfaces/contact-person.interface';
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
import { GetAllResultStatus } from '../interfaces/get-all-result-status.interface';
import { GetSubnationalsByIsoAlpha } from '../interfaces/get-subnationals-by-iso-alpha.interface';
import { ControlListCacheService } from './control-list-cache.service';
import { SignalEndpointService } from './signal-endpoint.service';
import { GetCurrentUser } from '../interfaces/get-current-user.interfce';
import { PatchSubmitResult, PatchSubmitResultLatest } from '../interfaces/patch_submit-result.interface';
import { GetClarisaInstitutionsTypes } from '@shared/interfaces/get-clarisa-institutions-types.interface';
import { GetSdgs } from '@shared/interfaces/get-sdgs.interface';
import { PatchIpOwner } from '@shared/interfaces/patch-ip-owners';
import { AIAssistantResult, CreateResultResponse } from '@shared/components/all-modals/modals-content/create-result-modal/models/AIAssistantResult';
import { GetYear } from '@shared/interfaces/get-year.interface';
import { ExtendedHttpErrorResponse } from '@shared/interfaces/http-error-response.interface';
import { GetVersions } from '@shared/interfaces/get-versions.interface';
import { AskForHelp } from '../components/all-modals/modals-content/ask-for-help-modal/interfaces/ask-for-help.interface';
import { GreenChecks } from '@shared/interfaces/get-green-checks.interface';
import { HttpParams } from '@angular/common/http';
import { GetInnovationDetails } from '@shared/interfaces/get-innovation-details.interface';
import { InnovationCharacteristic, InnovationLevel, InnovationType } from '@shared/interfaces/get-innovation.interface';
import { ActorType } from '@shared/interfaces/get-actor-types.interface';
import { ClarisaInstitutionsSubTypes } from '@shared/interfaces/get-clarisa-institutions-subtypes.interface';
import { DynamoFeedback } from '../interfaces/dynamo-feedback.interface';
import { IssueCategory } from '../interfaces/issue-category.interface';
import { GenericList } from '@shared/interfaces/generic-list.interface';
import { Initiative } from '@shared/interfaces/initiative.interface';
import { FindContractsResponse } from '../interfaces/find-contracts.interface';
import { GetLevers } from '@shared/interfaces/get-levers.interface';
import { Configuration } from '@shared/interfaces/configuration.interface';
import { GetTags } from '@shared/interfaces/get-tags.interface';
import { GetOICRDetails } from '@shared/interfaces/gets/get-oicr-details.interface';
import { LeverStrategicOutcome, Oicr, OicrCreation, PatchOicr } from '@shared/interfaces/oicr-creation.interface';
import { MaturityLevel } from '@shared/interfaces/maturity-level.interface';
import { InteractionFeedbackPayload } from '@shared/interfaces/feedback-interaction.interface';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  TP = inject(ToPromiseService);
  cache = inject(CacheService);
  clCache = inject(ControlListCacheService);
  private readonly signalEndpoint = inject(SignalEndpointService);

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

  GET_MaturityLevels = (): Promise<MainResponse<MaturityLevel[]>> => {
    const url = () => `maturity-levels`;
    return this.TP.get(url(), {});
  };

  GET_Institutions = (): Promise<MainResponse<GetInstitution[]>> => {
    const url = () => `tools/clarisa/institutions?location=true&type=true&only-hq=true`;
    return this.TP.get(url(), {});
  };

  GET_InstitutionsTypesChildless = (): Promise<MainResponse<GetClarisaInstitutionsTypes[]>> => {
    const url = () => `tools/clarisa/institutions-types/childless`;
    return this.TP.get(url(), {});
  };

  GET_SDGs = (): Promise<MainResponse<GetSdgs[]>> => {
    const url = () => `tools/clarisa/sdgs`;
    return this.TP.get(url(), {});
  };

  GET_Levers = (): Promise<MainResponse<GetLevers[]>> => {
    const url = () => `tools/clarisa/levers`;
    return this.TP.get(url(), {});
  };

  GET_InstitutionsTypes = (): Promise<MainResponse<GetClarisaInstitutionsTypes[]>> => {
    const url = () => `tools/clarisa/institutions-types`;
    return this.TP.get(url(), {});
  };

  GET_SubNationals = (isoAlpha2: string): Promise<MainResponse<GetSubnationalsByIsoAlpha[]>> => {
    const url = () => `tools/clarisa/sub-nationals/country/${isoAlpha2}`;
    return this.TP.get(url(), {});
  };

  GET_Tags = (): Promise<MainResponse<GetTags[]>> => {
    const url = () => `tags`;
    return this.TP.get(url(), {});
  };

  GET_OicrResults = (): Promise<MainResponse<Oicr[]>> => {
    const url = () => `temp/oicrs`;
    return this.TP.get(url(), {});
  };

  GET_Initiatives = (): Promise<MainResponse<Initiative[]>> => {
    const url = () => `tools/clarisa/initiatives`;
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
    const queryParams: string[] = [];

    if (resultFilter['indicator-codes-tabs']?.length) {
      if (resultFilter['indicator-codes-tabs'].length) {
        queryParams.push(`indicator-codes=${resultFilter['indicator-codes-tabs'].join(',')}`);
      }
    } else if (resultFilter['indicator-codes-filter']?.length) {
      queryParams.push(`indicator-codes=${resultFilter['indicator-codes-filter']?.join(',')}`);
    }

    // Dynamic handling of boolean config parameters
    if (resultConfig) {
      Object.entries(resultConfig).forEach(([key, value]) => {
        if (value) {
          queryParams.push(`${key}=true`);
        }
      });
    }

    // Dynamic handling of filter parameters
    if (resultFilter) {
      Object.entries(resultFilter).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length) {
          queryParams.push(`${key}=${value.join(',')}`);
        }
      });
    }

    const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
    const url = () => `results${queryString}`;
    return this.TP.get(url(), {});
  };

  GET_ValidateTitle = (title: string): Promise<MainResponse<{ isValid: boolean }>> => {
    const queryString = title ? `?title=${title}` : '';
    const url = () => `results/validate-title${queryString}`;
    return this.TP.get(url(), {});
  };

  POST_CreateOicr = <T>(body: T, resultCode?: number): Promise<MainResponse<Result>> => {
    const queryString = resultCode ? `?resultCode=${resultCode}` : '';
    const url = () => `results/oicr${queryString}`;
    return this.TP.patch(url(), body, {});
  };

  PATCH_Oicr = <T>(id: number, body: T): Promise<MainResponse<PatchOicr>> => {
    const url = () => `results/oicr/${id}`;
    return this.TP.patch(url(), body, { useResultInterceptor: true });
  };

  GET_Oicr = (id: number): Promise<MainResponse<PatchOicr>> => {
    const url = () => `results/oicr/${id}`;
    return this.TP.get(url(), { useResultInterceptor: true });
  };

  // create result
  POST_Result = <T>(body: T): Promise<MainResponse<Result>> => {
    const url = () => `results`;
    return this.TP.post(url(), body, {});
  };

  POST_CreateResult = (result: AIAssistantResult): Promise<MainResponse<CreateResultResponse | ExtendedHttpErrorResponse>> => {
    const url = () => `results/ai/formalize`;
    return this.TP.post(url(), result, {});
  };

  // dynamo feedback
  POST_DynamoFeedback = <T>(body: T): Promise<MainResponse<DynamoFeedback>> => {
    const url = () => `dynamo-feedback/save-data`;
    return this.TP.post(url(), body, {});
  };

  GET_DynamoFeedback = (): Promise<MainResponse<DynamoFeedback>> => {
    const url = () => `dynamo-feedback/test-data`;
    return this.TP.get(url(), {});
  };

  GET_IssueCategories = (): Promise<MainResponse<IssueCategory[]>> => {
    const url = () => `issue-categories`;
    return this.TP.get(url(), {});
  };

  GET_Configuration = (id: string, section: string): Promise<MainResponse<Configuration>> => {
    const url = () => `user/configuration/${id}?component=${section}`;
    return this.TP.get(url(), {});
  };

  PATCH_Configuration = (id: string, section: string, body: Configuration): Promise<MainResponse<Configuration>> => {
    const url = () => `user/configuration/${id}?component=${section}`;
    return this.TP.patch(url(), body, {});
  };

  // create partner request
  POST_PartnerRequest = <T>(body: T): Promise<MainResponse<Result>> => {
    const url = () => `tools/clarisa/manager/partner-request/create`;
    return this.TP.post(url(), body, {});
  };

  GET_UserStaff = (): Promise<MainResponse<UserStaff[]>> => {
    const url = () => `agresso/staff`;
    return this.TP.get(url(), {});
  };

  GET_AllianceStaff = (groupId: number): Promise<MainResponse<UserStaff[]>> => {
    const groupIdQuery = groupId ? `?groupId=${groupId}` : '';
    const url = () => `results/alliance-user-staff/by-groups/map${groupIdQuery}`;
    return this.TP.get(url(), {});
  };

  GET_GeneralInformation = (id: number): Promise<MainResponse<GeneralInformation>> => {
    const url = () => `results/${id}/general-information`;
    return this.TP.get(url(), { loadingTrigger: true, useResultInterceptor: true });
  };

  PATCH_GeneralInformation = <T>(id: number, body: T): Promise<MainResponse<GeneralInformation>> => {
    const url = () => `results/${id}/general-information`;
    return this.TP.patch(url(), body, {
      useResultInterceptor: true
    });
  };

  GET_Versions = (resultCode: number): Promise<MainResponse<GetVersions>> => {
    const url = () => `results/versions/${resultCode}`;
    return this.TP.get(url(), { useResultInterceptor: true });
  };

  GET_InnovationReadinessLevels = (): Promise<MainResponse<InnovationLevel[]>> => {
    const url = () => `tools/clarisa/innovation-readiness-levels`;
    return this.TP.get(url(), {});
  };

  GET_InnovationCharacteristics = (): Promise<MainResponse<InnovationCharacteristic[]>> => {
    const url = () => `tools/clarisa/innovation-characteristics`;
    return this.TP.get(url(), {});
  };

  GET_InformativeRoles = (): Promise<MainResponse<GenericList[]>> => {
    const url = () => `informative-roles`;
    return this.TP.get(url(), {});
  };

  GET_InnovationTypes = (): Promise<MainResponse<InnovationType[]>> => {
    const url = () => `tools/clarisa/innovation-types`;
    return this.TP.get(url(), {});
  };

  GET_InstitutionTypes = (): Promise<MainResponse<ClarisaInstitutionsSubTypes[]>> => {
    const url = () => `tools/clarisa/institutions-types`;
    return this.TP.get(url(), {});
  };

  GET_SubInstitutionTypes = (depthLevel: number, code?: number): Promise<MainResponse<ClarisaInstitutionsSubTypes[]>> => {
    const codeQuery = code !== undefined ? '?code=' + code : '';
    const url = () => `tools/clarisa/institutions-types/depth-level/${depthLevel}${codeQuery}`;
    return this.TP.get(url(), {});
  };

  GET_ActorTypes = (): Promise<MainResponse<ActorType[]>> => {
    const url = () => `tools/clarisa/actor-types`;
    return this.TP.get(url(), {});
  };

  GET_Partners = (id: number): Promise<MainResponse<PatchPartners>> => {
    const url = () => `results/institutions/by-result-id/${id}?role=partners`;
    return this.TP.get(url(), { loadingTrigger: true, useResultInterceptor: true });
  };

  PATCH_Partners = <T>(id: number, body: T): Promise<MainResponse<GeneralInformation>> => {
    const url = () => `results/institutions/partners/by-result-id/${id}`;
    return this.TP.patch(url(), body, { useResultInterceptor: true });
  };

  GET_InnovationDetails = (resultCode: number): Promise<MainResponse<GetInnovationDetails>> => {
    const url = () => `results/innovation-dev/${resultCode}`;
    return this.TP.get(url(), { loadingTrigger: true, useResultInterceptor: true });
  };

  PATCH_InnovationDetails = <T>(resultCode: number, body: T): Promise<MainResponse<GetInnovationDetails>> => {
    const url = () => `results/innovation-dev/${resultCode}`;
    return this.TP.patch(url(), body, { useResultInterceptor: true });
  };

  GET_ResultEvidences = (resultId: number): Promise<MainResponse<PatchResultEvidences>> => {
    const url = () => `results/evidences/principal/${resultId}`;
    return this.TP.get(url(), { loadingTrigger: true, useResultInterceptor: true });
  };

  PATCH_ResultEvidences = <T>(resultId: number, body: T): Promise<MainResponse<PatchResultEvidences>> => {
    const url = () => `results/evidences/by-result-id/${resultId}`;
    return this.TP.patch(url(), body, { useResultInterceptor: true });
  };

  GET_Years = (resultCode?: number, reportYear?: number): Promise<MainResponse<GetYear[]>> => {
    const url = 'results/year';

    let params = new HttpParams();
    if (resultCode != null) params = params.set('resultCode', resultCode.toString());
    if (reportYear != null) params = params.set('reportYear', reportYear.toString());

    return this.TP.get(url, { params });
  };

  GET_IpOwners = (): Promise<MainResponse<IpOwners[]>> => {
    const url = () => `results/intellectual-property/owners`;
    return this.TP.get(url(), { loadingTrigger: true });
  };

  GET_ApplicationOptions = (): Promise<MainResponse<GenericList[]>> => {
    const url = () => `results/intellectual-property/application-options`;
    return this.TP.get(url(), { loadingTrigger: true });
  };

  GET_DisseminationQualifications = (id?: number): Promise<MainResponse<GenericList[]>> => {
    const url = () => (id !== undefined ? `dissemination-qualifications/${id}` : 'dissemination-qualifications');
    return this.TP.get(url(), {});
  };

  GET_ToolFunctions = (): Promise<MainResponse<GenericList[]>> => {
    const url = () => `tool-functions`;
    return this.TP.get(url(), {});
  };

  GET_ExpansionPotentials = (): Promise<MainResponse<GenericList[]>> => {
    const url = () => `expansion-potentials`;
    return this.TP.get(url(), {});
  };

  GET_IpOwner = (id: number): Promise<MainResponse<PatchIpOwner>> => {
    const url = () => `results/intellectual-property/${id}`;
    return this.TP.get(url(), { loadingTrigger: true, useResultInterceptor: true });
  };

  PATCH_IpOwners = <T>(id: number, body: T): Promise<MainResponse<PatchIpOwner>> => {
    const url = () => `results/intellectual-property/${id}`;
    return this.TP.patch(url(), body, { useResultInterceptor: true });
  };

  GET_CapacitySharing = (): Promise<MainResponse<GetCapSharing>> => {
    const url = () => `results/capacity-sharing/by-result-id/${this.cache.getCurrentNumericResultId()}`;
    return this.TP.get(url(), { loadingTrigger: true, useResultInterceptor: true });
  };

  PATCH_CapacitySharing = <T>(body: T): Promise<MainResponse<GetCapSharing>> => {
    const url = () => `results/capacity-sharing/by-result-id/${this.cache.getCurrentNumericResultId()}`;
    return this.TP.patch(url(), body, { useResultInterceptor: true });
  };

  GET_PolicyChange = (id: number): Promise<MainResponse<GetPolicyChange>> => {
    const url = () => `results/policy-change/by-result-id/${id}`;
    return this.TP.get(url(), { loadingTrigger: true, useResultInterceptor: true });
  };

  PATCH_PolicyChange = <T>(id: number, body: T): Promise<MainResponse<GetPolicyChange>> => {
    const url = () => `results/policy-change/by-result-id/${id}`;
    return this.TP.patch(url(), body, { useResultInterceptor: true });
  };

  GET_Alignments = (id: number): Promise<MainResponse<GetAllianceAlignment>> => {
    const url = () => `results/${id}/alignments`;
    return this.TP.get(url(), { loadingTrigger: true, useResultInterceptor: true });
  };

  PATCH_Alignments = <T>(id: number, body: T): Promise<MainResponse<PatchAllianceAlignment>> => {
    const url = () => `results/${id}/alignments`;
    return this.TP.patch(url(), body, { useResultInterceptor: true });
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

  GET_ReferencesType = (): Promise<MainResponse<GenericList[]>> => {
    const url = () => `notable-reference-types`;
    return this.TP.get(url(), {});
  };

  GET_Metadata = (id: number, platform?: string): Promise<MainResponse<GetMetadata>> => {
    const url = () => `results/${id}/metadata`;
    return this.TP.get(url(), {
      useResultInterceptor: true,
      platform: platform
    });
  };

  GET_Countries = (params?: { 'is-sub-national'?: boolean }): Promise<MainResponse<GetCountries[]>> => {
    const url = () => `tools/clarisa/countries`;
    const stringParams = params ? Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])) : undefined;
    return this.TP.getWithParams(url(), stringParams);
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

  GET_ContractsByUser = (orderField?: string, direction?: string): Promise<MainResponse<GetContractsByUser[]>> => {
    const orderFieldQuery = orderField ? `&order-field=${orderField}` : '';
    const directionQuery = direction ? `&direction=${direction}` : '';
    const url = () => 'agresso/contracts/results/current-user';
    const fullUrl = `${url()}${orderFieldQuery}${directionQuery}`;
    return this.TP.get(fullUrl, {});
  };

  GET_FindContracts = (filters?: {
    'current-user'?: boolean;
    'contract-code'?: string;
    'project-name'?: string;
    'principal-investigator'?: string;
    lever?: string;
    status?: string;
    'start-date'?: string;
    'order-field'?: string;
    direction?: string;
    'end-date'?: string;
    query?: string;
    page?: string;
    limit?: string;
    project?: string;
  }): Promise<MainResponse<FindContractsResponse>> => {
    const url = () => 'agresso/contracts/find-contracts';
    const params = this.buildFindContractsParams(filters);
    return this.TP.get(url(), { params });
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

  GET_AllResultStatus = (): Promise<MainResponse<GetAllResultStatus[]>> => {
    const url = () => `results/status`;
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
    return this.TP.get(url(), { loadingTrigger: true, useResultInterceptor: true });
  };

  PATCH_GeoLocation = <T>(id: number, body: T): Promise<MainResponse<GetGeoLocation>> => {
    const url = () => `results/${id}/geo-location`;
    return this.TP.patch(url(), body, { useResultInterceptor: true });
  };

  GET_Regions = (): Promise<MainResponse<GetRegion[]>> => {
    const url = () => `tools/clarisa/regions`;
    return this.TP.get(url(), {});
  };

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

  indicatorsWithResult = this.signalEndpoint.createEndpoint<GetAllIndicators[]>(() => 'indicators/with/result');
  indicatorTabs = this.signalEndpoint.createEndpoint<GetAllIndicators[]>(() => 'indicators', 'indicatortabs');

  // Add the saveErrors endpoint
  saveErrors = (error: PostError): Promise<MainResponse<PostError>> => {
    const url = () => '';
    return this.TP.post(url(), { error }, { isAuth: environment.saveErrorsUrl });
  };

  GET_CurrentUser = (token: string): Promise<MainResponse<GetCurrentUser>> => {
    const url = () => `authorization/users/current`;
    return this.TP.get(url(), { isAuth: true, token });
  };

  PATCH_ReportingCycle = (resultCode: number, newReportYear: string) => {
    const url = () => `results/green-checks/new-reporting-cycle/${resultCode}/year/${newReportYear}`;
    return this.TP.patch(url(), {});
  };

  GET_AllSubmitionStatus = () => {
    const url = () => `results/green-checks/change/status`;
    return this.TP.get(url(), {});
  };

  PATCH_SubmitResult = (
    { resultCode, comment, status }: PatchSubmitResult,
    body?: PatchSubmitResultLatest
  ): Promise<MainResponse<PatchSubmitResult | ExtendedHttpErrorResponse>> => {
    const commentQuery = comment ? `&comment=${comment}` : '';
    const url = () => `results/green-checks/change/status?resultCode=${resultCode}${commentQuery}&status=${status}`;
    return this.TP.patch(url(), body ?? {}, { useResultInterceptor: true });
  };

  GET_ReviewStatuses = () => {
    const url = () => `results/status/review-statuses`;
    return this.TP.get(url(), {});
  };

  GET_GreenChecks = (resultCode: number, platform?: string): Promise<MainResponse<GreenChecks>> => {
    const basePath = `results/green-checks/${resultCode}`;
    const query = platform ? '?reportingPlatforms=' + platform : '';
    const url = () => basePath + query;
    return this.TP.get(url(), {});
  };

  GET_SubmitionHistory = (resultCode: number) => {
    const url = () => `results/green-checks/history/${resultCode}`;
    return this.TP.get(url(), { useResultInterceptor: true });
  };

  DELETE_Result = (resultCode: number) => {
    const url = () => `results/${resultCode}/delete`;
    return this.TP.delete(url(), { useResultInterceptor: true });
  };

  // Feedback | Ask for help
  PATCH_Feedback = (body: AskForHelp) => {
    const url = () => `reporting-feedback/send`;
    return this.TP.patch(url(), body);
  };

  GET_GithubVersion = () => {
    const timestamp = new Date().getTime();
    const urlWithTimestamp = `${environment.frontVersionUrl}?t=${timestamp}`;
    return this.TP.get('', { isAuth: urlWithTimestamp, noCache: true });
  };

  GET_OICRDetails = (resultCode: number | string): Promise<MainResponse<GetOICRDetails>> => {
    const url = () => `results/oicr/details/${resultCode}`;
    return this.TP.get(url(), {});
  };

  GET_OICRModal = (resultCode: number): Promise<MainResponse<OicrCreation>> => {
    const url = () => `results/oicr/${resultCode}/modal`;
    return this.TP.get(url(), {});
  };

  GET_OICRMetadata = (resultCode: number): Promise<MainResponse<OicrCreation>> => {
    const url = () => `temp/oicrs/${resultCode}/metadata`;
    return this.TP.get(url(), {});
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

  private buildFindContractsParams(filters?: {
    'current-user'?: boolean;
    'contract-code'?: string;
    'project-name'?: string;
    'principal-investigator'?: string;
    lever?: string;
    status?: string;
    'start-date'?: string;
    'end-date'?: string;
    query?: string;
    page?: string;
    limit?: string;
    project?: string;
  }): HttpParams {
    let params = new HttpParams();
    if (!filters) return params;
    const filterKeys: (keyof typeof filters)[] = [
      'current-user',
      'contract-code',
      'project-name',
      'principal-investigator',
      'lever',
      'status',
      'start-date',
      'end-date',
      'query',
      'page',
      'limit',
      'project'
    ];
    filterKeys.forEach(key => {
      const value = filters[key];
      if (value != null && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    return params;
  }

  fastResponse = (body: { prompt: string; input_text: string }) => {
    const url = () => `fast-response`;
    return this.TP.post(url(), body, { isAuth: environment.fastResponseUrl });
  };

  POST_feedback = (body: InteractionFeedbackPayload) => {
    const url = () => `interactions`;
    return this.TP.post(url(), body, { isAuth: environment.feedbackUrl });
  };

  GET_LeverStrategicOutcomes = (leverId: number): Promise<MainResponse<LeverStrategicOutcome[]>> => {
    const url = () => `lever-strategic-outcome/by-lever/${leverId}`;
    return this.TP.get(url(), {});
  };

  GET_AutorContact = (resultCode: number): Promise<MainResponse<ContactPersonResponse | ContactPersonResponse[]>> => {
    const url = () => `result-user/author-contact/by-result/${resultCode}`;
    return this.TP.get(url(), {useResultInterceptor: true});
  };

  POST_AutorContact = (body: { user_id: number; informative_role_id: number }, resultCode: number): Promise<MainResponse<ContactPersonResponse>> => {
    const url = () => `result-user/author-contact/save-by-result/${resultCode}`;
    return this.TP.post(url(), body, {});
  };

  DELETE_AutorContact = (resultUserId: number, resultId: number) => {
    const url = () => `result-user/author-contact/${resultUserId}/by-result/${resultId}`;
    return this.TP.delete(url(), { useResultInterceptor: true });
  };

}
