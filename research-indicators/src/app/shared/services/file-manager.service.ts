import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CacheService } from './cache/cache.service';
import { environment } from '@envs/environment';

export interface FileUploadResponse {
  data: { filename: string };
}
@Injectable({
  providedIn: 'root'
})
export class FileManagerService {
  cache = inject(CacheService);

  constructor(private readonly http: HttpClient) {}

  async uploadFile(file: File, weightLimit: number, pageLimit: number): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    formData.append('bucketName', 'microservice-mining');
    formData.append('fileName', file.name);

    const weightLimitBytes = weightLimit * 1024 * 1024;
    formData.append('weightLimit', weightLimitBytes.toString());
    formData.append('pageLimit', pageLimit.toString());
    formData.append('environmentUrl', environment.managementApiUrl);

    const headers = new HttpHeaders({
      'access-token': this.cache.dataCache().access_token,
      'environment-url': environment.managementApiUrl
    });

    try {
      const response = await firstValueFrom(
        this.http.post<FileUploadResponse>(`${environment.fileManagerUrl}/api/file-management/upload-file`, formData, { headers })
      );
      return response;
    } catch (error) {
      console.error('Error en el procesamiento del archivo:', error);
      throw error;
    }
  }
}
