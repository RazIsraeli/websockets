import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private readonly socket: Socket;
  private readonly wsUrl: string = 'http://localhost:3000';

  constructor() {
    //Connect to the websocket server
    this.socket = io(this.wsUrl);

    //Listen for connection events:
    this.socket.on('connect', () => {
      console.log(`Connected to websocket server with id: `, this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from websocket server');
    });

    // Listening to custom events:
    this.socket.on('client-connected', (data) => {
      console.log('Client connected:')
      console.log("🚀 ~ WebsocketService ~ this.socket.on ~ data:", data)
    });

    this.socket.on('client-disconnected', (data) => {
      console.log('Client disconnected:')
      console.log("🚀 ~ WebsocketService ~ this.socket.on ~ data:", data)
    });
  }

  //Emit an event to the server
  sendMessage(event: string, message: any): void {
    this.socket.emit(event, message);
  }

  //Subscribe to an event from the server
  onMessage(event: string, callback: (data: any) => void): void {
    this.socket.on(event, callback);
  }

  listenForBroadCast(): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on('broadcast-message', (data) => {
        subscriber.next(data);
      });
    });
  }

}
