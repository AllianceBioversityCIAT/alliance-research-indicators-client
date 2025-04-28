import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// DTOs
export interface FileManagerDto {
  file: File;
  bucketName: string;
  fileName: string;
}

export interface ResponseFileManagerDto {
  status: number;
  description: string;
  data: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    location: string;
  };
  errors: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileManagerService {
  private readonly baseUrl = 'https://reports.prms.cgiar.org/api'; // STAR_MS_FILE_MANAGER_URL
  private readonly clientId = '70a982c5-8980-45cc-944a-757ab0c84830'; // STAR_MS_FILE_MANAGER_CLIENT_ID
  private readonly clientSecret = '1vC/8[#i[j?f|bKpL%4B.Q2tZ6!f:*Z>'; // STAR_MS_FILE_MANAGER_SECRET
  private readonly bucketName = 'microservice-mining'; // STAR_MS_FILE_MANAGER_BUCKET_NAME

  constructor(private readonly http: HttpClient) {}

  private generateFileName(file: File, userId: string): string {
    const [fileName, fileType] = file.name.replace(/\s+/g, '_').trim().split('.');
    const timestamp = new Date().getTime();
    return `${fileName}-${userId}-${timestamp}.${fileType}`;
  }

  async uploadFile(file: File, userId: string): Promise<ResponseFileManagerDto> {
    const formData = new FormData();

    const fileName = this.generateFileName(file, userId);

    formData.append('file', file, file.name);
    formData.append('fileName', fileName);
    formData.append('bucketName', this.bucketName);

    const headers = new HttpHeaders({
      Auth: JSON.stringify({
        username: this.clientId,
        password: this.clientSecret
      })
      // 'Content-Type' no se pone manualmente con FormData; Angular lo maneja automáticamente
    });

    try {
      const response = await firstValueFrom(this.http.post<ResponseFileManagerDto>(`${this.baseUrl}/file-management/upload`, formData, { headers }));
      return response;
    } catch (error) {
      console.error('Error occurred during file manager:', error);
      throw error;
    }
  }
}
