import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import { NoWhitespaceValidator } from 'projects/shared-helper-modules/custom-validators.validator';
import { ICurrentUser } from 'projects/shared-models/current_user.model';
import { IUserMessage } from 'projects/shared-models/user_message.model';

@Component({
  selector: 'app-qna-list-item',
  templateUrl: './qna-list-item.component.html',
  styleUrls: ['./qna-list-item.component.scss']
})
export class QnaListItemComponent implements OnInit {

  @Input() canReply: boolean;
  @Input() canVote: boolean;
  @Input() message: IUserMessage;
  @Input() currentUser: ICurrentUser;
  @Input() allActions;
  @Input() permittedActions;
  @Output() sendReply: EventEmitter<any> = new EventEmitter<any>();
  @Output() sendVote: EventEmitter<number> = new EventEmitter<number>();
  @Output() sendFlag: EventEmitter<number> = new EventEmitter<number>();
  @Output() sendDelete: EventEmitter<number> = new EventEmitter<number>();

  moment = moment;

  showReplyForm = false;
  showEmojiPicker = false;

  replyForm = this.fb.group({
    content: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(200), NoWhitespaceValidator]]
  });

  @ViewChild('messageInput') messageInput: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder
  ) {
  }

  ngOnInit(): void {
  }

  emitReply(): void {
    if (this.replyForm.valid) {
      this.sendReply.emit(this.replyForm.value);
      this.replyForm.reset();
      this.replyForm.updateValueAndValidity();
      this.showReplyForm = false;
    }
  }

  emitVote(messageId: number): void {
    this.sendVote.emit(messageId);
  }

  emitFlag(messageId: number): void {
    this.sendFlag.emit(messageId);
  }

  emitDelete(messageId: number): void {
    this.sendDelete.emit(messageId);
  }

  addEmoji(event): void {
    this.replyForm.patchValue({
      content: (this.replyForm.get('content').value || '').concat(`${event.emoji.native}`)
    });
    this.messageInput.nativeElement.focus();
  }

}
