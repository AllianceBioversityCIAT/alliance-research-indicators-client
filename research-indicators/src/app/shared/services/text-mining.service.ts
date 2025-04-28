import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// DTOs
export class TextMiningDto {
  bucketName!: string;
  key!: string;
  credentials!: {
    username: string;
    password: string;
  };
  prompt?: string;
}

export interface RootAi {
  results: ResultRawAi[];
}

export interface ResultRawAi {
  indicator: string;
  title: string;
  description: string;
  keywords: string[];
  geoscope: GeoscopeRawAi;
  training_type: string;
  total_participants: number;
  male_participants: number | null;
  female_participants: number | null;
  non_binary_participants: string;
  training_modality: string;
  start_date: string;
  end_date: string;
  length_of_training: string;
  alliance_main_contact_person_first_name: string;
  alliance_main_contact_person_last_name: string;
  evidence_for_stage: string;
  policy_type: string;
  stage_in_policy_process: string;
}

export interface GeoscopeRawAi {
  level: string;
  sub_list?: CountryArea[];
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
  annotations?: any;
}

@Injectable({
  providedIn: 'root'
})
export class TextMiningService {
  private readonly baseUrl = 'http://mining-load-balancer-232292462.us-east-1.elb.amazonaws.com'; // STAR_MS_AI_URL
  private readonly clientId = 'e9dc4415-9cc2-48ff-81f8-7b18737cc31b'; // STAR_MS_AI_CLIENT_ID
  private readonly clientSecret = '0AV>U3/[z@w*m?>>fZRb_3J_&DN2v<Q^'; // STAR_MS_AI_SECRET
  private readonly bucketName = 'microservice-mining'; // STAR_MS_FILE_MANAGER_BUCKET_NAME

  constructor(private readonly http: HttpClient) {}

  async executeTextMining(documentName: string): Promise<ResponseAiRoarDto> {
    const formData: TextMiningDto = {
      credentials: {
        username: this.clientId,
        password: this.clientSecret
      },
      key: documentName,
      bucketName: this.bucketName
    };

    try {
      const response = await firstValueFrom(this.http.post<ResponseAiRoarDto>(`${this.baseUrl}/process`, formData));
      return response;
    } catch (error) {
      console.error('Error occurred during text mining:', error);
      throw error;
    }
  }
}
