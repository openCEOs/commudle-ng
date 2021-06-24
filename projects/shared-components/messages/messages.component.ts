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
import { UserMessagesService } from 'projects/commudle-admin/src/app/services/user-messages.service';
import { DiscussionChatChannel } from 'projects/shared-components/services/websockets/discussion-chat.channel';
import { NoWhitespaceValidator } from 'projects/shared-helper-modules/custom-validators.validator';
import { ICurrentUser } from 'projects/shared-models/current_user.model';
import { IDiscussion } from 'projects/shared-models/discussion.model';
import { IUserMessage } from 'projects/shared-models/user_message.model';
import { LibAuthwatchService } from 'projects/shared-services/lib-authwatch.service';
import { LibToastLogService } from 'projects/shared-services/lib-toastlog.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit, OnDestroy, AfterContentChecked {

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
    private discussionChatChannel: DiscussionChatChannel,
    private libToastLogService: LibToastLogService,
    private userMessagesService: UserMessagesService,
    private fb: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.subscriptions.push(this.libAuthwatchService.currentUser$.subscribe(value => this.currentUser = value));
    this.discussionChatChannel.subscribe(`${this.discussion.id}`);
    this.allActions = this.discussionChatChannel.ACTIONS;
    this.receiveData();
    this.getDiscussionMessages();
  }

  ngOnDestroy(): void {
    this.discussionChatChannel.unsubscribe();
    this.subscriptions.forEach(value => value.unsubscribe());
  }

  ngAfterContentChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  receiveData(): void {
    this.subscriptions.push(this.discussionChatChannel.channelData$.subscribe(value => {
      if (value) {
        switch (value.action) {
          case this.discussionChatChannel.ACTIONS.SET_PERMISSIONS:
            this.permittedActions = value.permitted_actions;
            break;
          case this.discussionChatChannel.ACTIONS.ADD:
            this.messages.push(value.user_message);
            this.newMessage.emit();
            break;
          case this.discussionChatChannel.ACTIONS.REPLY:
            this.messages[this.findMessageIndex(value.parent_id)].user_messages.push(value.user_message);
            this.newMessage.emit();
            break;
          case this.discussionChatChannel.ACTIONS.DELETE:
            if (value.parent_type === 'Discussion') {
              this.messages.splice(this.findMessageIndex(value.user_message_id), 1);
            } else {
              const qi = this.findMessageIndex(value.parent_id);
              this.messages[qi].user_messages.splice(this.findReplyIndex(qi, value.user_message_id), 1);
            }
            break;
          case this.discussionChatChannel.ACTIONS.FLAG:
            if (value.parent_type === 'Discussion') {
              this.messages[this.findMessageIndex(value.user_message_id)].flags_count += value.flag;
            } else {
              const qi = this.findMessageIndex(value.parent_id);
              this.messages[qi].user_messages[this.findReplyIndex(qi, value.user_message_id)].flags_count += value.flag;
            }
            break;
          case this.discussionChatChannel.ACTIONS.ERROR:
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
      this.discussionChatChannel.sendData(
        this.discussionChatChannel.ACTIONS.ADD, { user_message: messageContent }
      );
      this.messageForm.reset();
      this.messageForm.updateValueAndValidity();
    }
  }

  sendReply(value): void {
    const messageId = value[0];
    const replyContent = value[1];
    this.discussionChatChannel.sendData(
      this.discussionChatChannel.ACTIONS.REPLY, { user_message_id: messageId, reply_message: replyContent }
    );
  }

  sendFlag(messageId: number): void {
    this.discussionChatChannel.sendData(
      this.discussionChatChannel.ACTIONS.FLAG, { user_message_id: messageId }
    );
  }

  sendDelete(messageId: number): void {
    this.discussionChatChannel.sendData(
      this.discussionChatChannel.ACTIONS.DELETE, { user_message_id: messageId }
    );
  }

  addEmoji(event): void {
    this.messageForm.patchValue({
      content: (this.messageForm.get('content').value || '').concat(`${event.emoji.native}`)
    });
    this.messageInput.nativeElement.focus();
  }

}
