import { Injectable, WritableSignal, inject } from '@angular/core';
import { ToPromiseService } from './to-promise.service';
import { LoginRes, MainResponse } from '../interfaces/responses.interface';
import { GetViewComponents, Indicator, IndicatorTypes } from '../interfaces/api.interface';
import { GeneralInformation } from '@interfaces/result/general-information.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  TP = inject(ToPromiseService);

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

  GET_Contracts = (): Promise<MainResponse<any[]>> => {
    const url = () => `agresso-contract/contracts`;
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

  GET_Results = (): Promise<MainResponse<any[]>> => {
    const url = () => `results`;
    return this.TP.get(url(), {});
  };

  POST_Result = (body: any): Promise<MainResponse<any>> => {
    const url = () => `results`;
    return this.TP.post(url(), body, {});
  };

  GET_GeneralInformation = (id: number): Promise<MainResponse<GeneralInformation>> => {
    const url = () => `results/${id}/general-information`;
    return this.TP.get(url(), {});
  };

  PATCH_GeneralInformation = (id: number, body: any): Promise<MainResponse<any>> => {
    const url = () => `results/${id}/general-information`;
    return this.TP.patch(url(), body);
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
