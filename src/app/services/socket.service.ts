import { Injectable, EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import io from 'socket.io-client';
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  
  socket: any;
  constructor() { 
    this.socket = io('ws://cc56-196-250-208-122.ngrok-free.app');
  }

  listen(eventName: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data: any) => {
        subscriber.next(data);
      });
    });
  }


  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }
 
}
