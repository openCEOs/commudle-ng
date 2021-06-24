import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { UserMessagesService } from 'projects/commudle-admin/src/app/services/user-messages.service';
import { DiscussionQnAChannel } from 'projects/shared-components/services/websockets/discussion-qna.channel';
import { NoWhitespaceValidator } from 'projects/shared-helper-modules/custom-validators.validator';
import { ICurrentUser } from 'projects/shared-models/current_user.model';
import { IDiscussion } from 'projects/shared-models/discussion.model';
import { IUserMessage } from 'projects/shared-models/user_message.model';
import { LibAuthwatchService } from 'projects/shared-services/lib-authwatch.service';
import { LibToastLogService } from 'projects/shared-services/lib-toastlog.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-qna',
  templateUrl: './qna.component.html',
  styleUrls: ['./qna.component.scss']
})
export class QnaComponent implements OnInit, OnDestroy, AfterContentChecked {

  @Input() discussion: IDiscussion;
  @Output() newMessage: EventEmitter<any> = new EventEmitter<any>();

  currentUser: ICurrentUser;

  allActions;
  permittedActions = [];

  messages: IUserMessage[] = [];
  page = 1;
  count = 10;
  isLoadingMessages = true;
  showMessagesLoader = true;
  showEmojiPicker = false;

  messageForm = this.fb.group({
    content: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(200), NoWhitespaceValidator]]
  });

  @ViewChild('messageInput') messageInput: ElementRef<HTMLInputElement>;

  subscriptions: Subscription[] = [];

  constructor(
    private libAuthwatchService: LibAuthwatchService,
    private discussionQnaChannel: DiscussionQnAChannel,
    private libToastLogService: LibToastLogService,
    private userMessagesService: UserMessagesService,
    private fb: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.subscriptions.push(this.libAuthwatchService.currentUser$.subscribe(value => this.currentUser = value));
    this.discussionQnaChannel.subscribe(`${this.discussion.id}`);
    this.allActions = this.discussionQnaChannel.ACTIONS;
    this.receiveData();
    this.getDiscussionMessages();
  }

  ngOnDestroy(): void {
    this.discussionQnaChannel.unsubscribe();
    this.subscriptions.forEach(value => value.unsubscribe());
  }

  ngAfterContentChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  receiveData(): void {
    this.subscriptions.push(this.discussionQnaChannel.channelData$.subscribe(value => {
      if (value) {
        switch (value.action) {
          case this.discussionQnaChannel.ACTIONS.SET_PERMISSIONS:
            this.permittedActions = value.permitted_actions;
            break;
          case this.discussionQnaChannel.ACTIONS.ADD:
            this.messages.push(value.user_message);
            this.newMessage.emit();
            break;
          case this.discussionQnaChannel.ACTIONS.REPLY:
            this.messages[this.findMessageIndex(value.parent_id)].user_messages.push(value.user_message);
            this.newMessage.emit();
            break;
          case this.discussionQnaChannel.ACTIONS.DELETE:
            if (value.parent_type === 'Discussion') {
              this.messages.splice(this.findMessageIndex(value.user_message_id), 1);
            } else {
              const qi = this.findMessageIndex(value.parent_id);
              this.messages[qi].user_messages.splice(this.findReplyIndex(qi, value.user_message_id), 1);
            }
            break;
          case this.discussionQnaChannel.ACTIONS.FLAG:
            if (value.parent_type === 'Discussion') {
              this.messages[this.findMessageIndex(value.user_message_id)].flags_count += value.flag;
            } else {
              const qi = this.findMessageIndex(value.parent_id);
              this.messages[qi].user_messages[this.findReplyIndex(qi, value.user_message_id)].flags_count += value.flag;
            }
            break;
          case this.discussionQnaChannel.ACTIONS.VOTE:
            if (value.parent_type === 'Discussion') {
              this.messages[this.findMessageIndex(value.user_message_id)].votes_count += value.vote;
            } else {
              const qi = this.findMessageIndex(value.parent_id);
              this.messages[qi].user_messages[this.findReplyIndex(qi, value.user_message_id)].votes_count += value.vote;
            }
            break;
          case this.discussionQnaChannel.ACTIONS.ERROR:
            this.libToastLogService.warningDialog(value.message, 2000);
            break;
        }
      }
    }));
  }

  findMessageIndex(userMessageId) {
    return this.messages.findIndex(q => q.id === userMessageId);
  }

  findReplyIndex(questionIndex, replyId) {
    return this.messages[questionIndex].user_messages.findIndex(q => q.id === replyId);
  }

  getDiscussionMessages(): void {
    if (this.isLoadingMessages) {
      this.subscriptions.push(
        this.userMessagesService.pGetDiscussionChatMessages(this.discussion.id, this.page, this.count).subscribe(value => {
          if (value.user_messages.length !== this.count) {
            this.isLoadingMessages = false;
            this.showMessagesLoader = false;
          }
          this.messages.unshift(...value.user_messages.reverse());
          this.page++;
        })
      );
    }
  }

  sendMessage(): void {
    if (this.messageForm.valid) {
      const messageContent = this.messageForm.value;
      this.discussionQnaChannel.sendData(
        this.discussionQnaChannel.ACTIONS.ADD, { user_message: messageContent }
      );
      this.messageForm.reset();
      this.messageForm.updateValueAndValidity();
    }
  }

  sendReply(value): void {
    const messageId = value[0];
    const replyContent = value[1];
    this.discussionQnaChannel.sendData(
      this.discussionQnaChannel.ACTIONS.REPLY, { user_message_id: messageId, reply_message: replyContent }
    );
  }

  sendVote(messageId: number): void {
    this.discussionQnaChannel.sendData(
      this.discussionQnaChannel.ACTIONS.VOTE, { user_message_id: messageId }
    );
  }

  sendFlag(messageId: number): void {
    this.discussionQnaChannel.sendData(
      this.discussionQnaChannel.ACTIONS.FLAG, { user_message_id: messageId }
    );
  }

  sendDelete(messageId: number): void {
    this.discussionQnaChannel.sendData(
      this.discussionQnaChannel.ACTIONS.DELETE, { user_message_id: messageId }
    );
  }

  addEmoji(event): void {
    this.messageForm.patchValue({
      content: (this.messageForm.get('content').value || '').concat(`${event.emoji.native}`)
    });
    this.messageInput.nativeElement.focus();
  }

  sortMessages(value: string): void {
    switch (value) {
      case 'newest':
        this.messages = _.sortBy(this.messages, ['created_at'], ['asc']);
        break;
      case 'oldest':
        this.messages = _.sortBy(this.messages, ['created_at']).reverse();
        break;
      case 'votes':
        this.messages = _.sortBy(this.messages, ['votes_count']).reverse();
        break;
    }
  }

}
