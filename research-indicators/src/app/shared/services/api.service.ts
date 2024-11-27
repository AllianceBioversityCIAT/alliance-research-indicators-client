import { Injectable, WritableSignal, inject } from '@angular/core';
import { ToPromiseService } from './to-promise.service';
import { LoginRes, MainResponse } from '../interfaces/responses.interface';
import { GetViewComponents, Indicator, IndicatorTypes } from '../interfaces/api.interface';
import { GeneralInformation } from '@interfaces/result/general-information.interface';
import { GetContracts } from '../interfaces/get-contracts.interface';
import { Result } from '../interfaces/result/result.interface';
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
    return this.TP.post(url(), {}, { token: refreshToken, isAuth: true });
  };

  GET_IndicatorTypes = (): Promise<MainResponse<IndicatorTypes[]>> => {
    const url = () => `indicator-types`;
    return this.TP.get(url(), {});
  };

  GET_Contracts = (): Promise<MainResponse<GetContracts[]>> => {
    const url = () => `agresso-contract/contracts`;
    return this.TP.get(url(), {});
  };

  GET_Institutions = (): Promise<MainResponse<GetInstitution[]>> => {
    const url = () => `clarisa/institutions`;
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

  GET_Results = (): Promise<MainResponse<Result[]>> => {
    const url = () => `results`;
    return this.TP.get(url(), {});
  };

  // create result
  POST_Result = <T>(body: T): Promise<MainResponse<Result>> => {
    const url = () => `results`;
    return this.TP.post(url(), body, {});
  };

  GET_UserStaff = (): Promise<MainResponse<UserStaff[]>> => {
    const url = () => `results/alliance-user-staff`;
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
    const url = () => `clarisa/levers`;
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
    const url = () => `clarisa/countries`;
    return this.TP.get(url(), {});
  };

  GET_DeliveryModalities = (): Promise<MainResponse<GetDeliveryModality[]>> => {
    const url = () => `delivery-modalities`;
    return this.TP.get(url(), {});
  };

  GET_Languages = (): Promise<MainResponse<GetLanguages[]>> => {
    const url = () => `clarisa/languages`;
    return this.TP.get(url(), {});
  };

  GET_SessionPurpose = (): Promise<MainResponse<SessionPurpose[]>> => {
    const url = () => `session/purpose`;
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
}
