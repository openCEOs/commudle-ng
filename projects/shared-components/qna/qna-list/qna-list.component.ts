import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import * as moment from 'moment';
import { ICurrentUser } from 'projects/shared-models/current_user.model';
import { IUserMessage } from 'projects/shared-models/user_message.model';

@Component({
  selector: 'app-qna-list',
  templateUrl: './qna-list.component.html',
  styleUrls: ['./qna-list.component.scss']
})
export class QnaListComponent implements OnInit, AfterViewInit {

  @Input() messages: IUserMessage[] = [];
  @Input() currentUser: ICurrentUser;
  @Input() allActions;
  @Input() permittedActions;
  @Input() showMessagesLoader;
  @Output() getPreviousMessages: EventEmitter<any> = new EventEmitter<any>();
  @Output() sendReply: EventEmitter<any> = new EventEmitter<any>();
  @Output() sendVote: EventEmitter<number> = new EventEmitter<number>();
  @Output() sendFlag: EventEmitter<number> = new EventEmitter<number>();
  @Output() sendDelete: EventEmitter<number> = new EventEmitter<number>();

  moment = moment;
  messageContainer: any;
  isNearBottom: boolean;

  @ViewChild('messagesList') messagesList: ElementRef<HTMLDivElement>;
  @ViewChildren('message') messageElements: QueryList<any>;

  constructor() {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.messageContainer = this.messagesList.nativeElement;
    this.messageElements.changes.subscribe(value => this.onMessageElementsChanged(value));
  }

  emitReply(messageId: number, content): void {
    this.sendReply.emit([messageId, content]);
  }

  emitVote(messagedId: number): void {
    this.sendVote.emit(messagedId);
  }

  emitFlag(messagedId: number): void {
    this.sendFlag.emit(messagedId);
  }

  emitDelete(messageId: number): void {
    this.sendDelete.emit(messageId);
  }

  onMessageElementsChanged(value): void {
    if (this.isNearBottom || this.currentUser?.id === value.last.message.user.id) {
      this.scrollToBottom();
    }
  }

  scrollToBottom(): void {
    this.messageContainer.scroll({
      top: this.messageContainer.scrollHeight,
      behavior: 'smooth'
    });
  }

  onScroll(): void {
    this.isNearBottom = this.isUserNearBottom();
  }

  isUserNearBottom(): boolean {
    const threshold = 150;
    const position = this.messageContainer.scrollTop + this.messageContainer.offsetHeight;
    const height = this.messageContainer.scrollHeight;
    return position > height - threshold;
  }

}
