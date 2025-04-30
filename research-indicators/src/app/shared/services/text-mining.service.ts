import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CacheService } from './cache/cache.service';
import { ApiService } from './api.service';
import { AIAssistantResult } from '@shared/components/all-modals/modals-content/create-result-modal/models/AIAssistantResult';

export class TextMiningDto {
  bucketName!: string;
  key!: string;
  token!: string;
  prompt?: string;
}

export interface RootAi {
  results: AIAssistantResult[];
}

export interface CountryArea {
  country_code: string;
  areas: string[];
}

export interface ResponseAiRoarDto {
  content: MiningTextItem[];
}

export interface MiningTextItem {
  type: string;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class TextMiningService {
  private readonly baseUrl = 'https://d3djd7q7g7v7di.cloudfront.net';

  cache = inject(CacheService);
  api = inject(ApiService);

  constructor(private readonly http: HttpClient) {}

  async executeTextMining(documentName: string): Promise<ResponseAiRoarDto> {
    const formData = new FormData();
    formData.append('token', this.cache.dataCache().access_token);
    formData.append('key', documentName);
    formData.append('bucketName', 'microservice-mining');

    const headers = new HttpHeaders({
      'access-token': this.cache.dataCache().access_token
    });

    try {
      const response = await firstValueFrom(this.http.post<ResponseAiRoarDto>(`${this.baseUrl}/process`, formData, { headers }));
      return response;
    } catch (error) {
      console.error('Error occurred during text mining:', error);
      throw error;
    }
  }
}
