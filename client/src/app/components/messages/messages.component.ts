import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WebsocketService } from '../../services/websocket.service';


@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent implements OnInit {

  wsService = inject(WebsocketService);

  msg: string = '';

  messages: { senderId: string; message: string }[] = [];
  counter = signal(0);
  addToCounterVal: number = 0;

  constructor() {
    this.wsService.listenForBroadCast().subscribe(
      {
        next: (data) => {
          this.messages.push(data);
          this.counter.update(count => count + 1);
        },
        error: (err) => {
          throw new Error(err);
        }
      }
    )
  }

  ngOnInit(): void {
    this.wsService.onMessage('custom-event', (data) => {
      console.log('Received from server: ', data);
    });
  }

  sendMessage(): void {
    //Handle invalid input
    if (!this.msg) {
      return;
    }
    //Send a custom event to the server
    this.wsService.sendMessage('button-clicked', { message: this.msg });
    this.msg = '';
  }

  addToCounter(value: number): void {
    if (!value) return;
    this.counter.update(count => count + value);
    this.addToCounterVal = 0;
  }

}
