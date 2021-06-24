import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IDiscussion } from 'projects/shared-models/discussion.model';

@Component({
  selector: 'app-session-page-chat',
  templateUrl: './session-page-chat.component.html',
  styleUrls: ['./session-page-chat.component.scss']
})
export class SessionPageChatComponent implements OnInit {

  @Input() chat: IDiscussion;
  @Output() newMessage: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit(): void {
  }

  newMessageNotification(): void {
    this.newMessage.emit();
  }

}
