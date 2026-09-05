import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TranscripcionResponse {
  transcripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  private apiUrl = 'http://localhost:8080/api/audio';

  constructor(private http: HttpClient) {}

  transcribir(audio: Blob): Observable<TranscripcionResponse> {

    const formData = new FormData();

    formData.append(
      'audio',
      audio,
      'reporte.webm'
    );

    return this.http.post<TranscripcionResponse>(
      `${this.apiUrl}/transcribir`,
      formData
    );
  }
}