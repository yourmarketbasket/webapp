import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private cloudName = 'dizorty5m';  // Replace with your actual Cloudinary cloud name
  private uploadPreset = 'preset_1';  // Replace with your unsigned upload preset

  constructor(private http: HttpClient) {}

  uploadFiles(files: File[]): Observable<any> {
    // Store individual file upload observables
    const uploadObservables = files.map((file, index) => this.uploadSingleFile(file, index, files.length));

    // Use forkJoin to combine all upload observables and emit when all are complete
    return forkJoin(uploadObservables).pipe(
      map(results => ({
        status: 'complete',
        message: 'All files uploaded successfully',
        results
      })),
      catchError(error => of({ status: 'error', message: error.message }))
    );
  }

  private uploadSingleFile(file: File, fileIndex: number, totalFiles: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

    return this.http.post(url, formData, {
      headers: new HttpHeaders({ 'X-Requested-With': 'XMLHttpRequest' }),
      reportProgress: true,
      observe: 'events',
    }).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = event.total ? Math.round((100 * event.loaded) / event.total) : 0;
            const overallProgress = Math.round((progress + fileIndex * 100) / totalFiles);
            return { status: 'progress', fileIndex, progress, overallProgress };
          case HttpEventType.Response:
            const responseBody = event.body;
            // Construct the transformation URL
            const transformedUrl = this.getTransformedUrl(responseBody.public_id, responseBody.version, responseBody.format);
            return { status: 'complete', fileIndex, message: responseBody, transformedUrl };
          default:
            return { status: 'other', fileIndex };
        }
      }),
      catchError((error) => of({ status: 'error', fileIndex, message: error.message }))
    );
  }

  private getTransformedUrl(publicId: string, version: string, format: string): string {
    const transformation = 't_thumbnail_100x100'; // Specify your transformation here
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformation}/v${version}/${publicId}.${format}`; // Use the correct file format
  }
}
