import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CacheService } from './cache/cache.service';

export interface FileUploadResponse {
  data: { filename: string };
}
@Injectable({
  providedIn: 'root'
})
export class FileManagerService {
  private readonly baseUrl = 'https://reports.prms.cgiar.org';
  cache = inject(CacheService);

  constructor(private readonly http: HttpClient) {}

  async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    formData.append('bucketName', 'microservice-mining');
    formData.append('fileName', file.name);

    const headers = new HttpHeaders({
      'access-token': this.cache.dataCache().access_token
    });

    try {
      const response = await firstValueFrom(
        this.http.post<FileUploadResponse>(`${this.baseUrl}/api/file-management/upload-file`, formData, { headers })
      );
      return response;
    } catch (error) {
      console.error('Error en el procesamiento del archivo:', error);
      throw error;
    }
  }
}
