import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserChatsService } from 'projects/commudle-admin/src/app/feature-modules/user-chats/services/user-chats.service';
import { UserChatMessagesChannel } from 'projects/commudle-admin/src/app/feature-modules/user-chats/services/websockets/user-chat-messages.channel';
import { SDiscussionsService } from 'projects/shared-components/services/s-discussions.service';
import { ICurrentUser } from 'projects/shared-models/current_user.model';
import { IDiscussionFollower } from 'projects/shared-models/discussion-follower.model';
import { LibAuthwatchService } from 'projects/shared-services/lib-authwatch.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chats-container',
  templateUrl: './chats-container.component.html',
  styleUrls: ['./chats-container.component.scss']
})
export class ChatsContainerComponent implements OnInit, OnDestroy {

  // Number of allowed chat windows
  numChatWindows: number;
  // Chats windows distance from right
  chatsWindowsRight = 322;

  // All the persons we can chat with
  allPersonalChatUsers: IDiscussionFollower[] = [];
  // The persons with whom we are chatting with
  discussionFollowers: IDiscussionFollower[] = [];
  // The current user
  currentUser: ICurrentUser;

  subscriptions: Subscription[] = [];

  constructor(
    private sDiscussionService: SDiscussionsService,
    private userChatMessagesChannel: UserChatMessagesChannel,
    private authWatchService: LibAuthwatchService,
    private userChatsService: UserChatsService
  ) {
  }

  ngOnInit() {
    // Get current user data
    this.subscriptions.push(this.authWatchService.currentUser$.subscribe(data => this.currentUser = data));

    // Get the current user's chats
    this.subscriptions.push(this.sDiscussionService.getPersonalChats().subscribe(data => {
      this.allPersonalChatUsers = data.discussion_followers;
    }));

    // TODO: Make this better
    // Calculate screen width to find the number of chat windows that are allowed simultaneously
    this.numChatWindows = Math.floor((window.innerWidth - 300) / 355);
    if (window.innerWidth < 1000) {
      this.chatsWindowsRight = 5;
    }

    // If clicked on messaging button in any user profile
    this.subscriptions.push(this.userChatsService.followerIdChange$.subscribe(data => this.createChat(data)));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(value => value.unsubscribe());
  }

  createChat(followerId: number) {
    this.subscriptions.push(this.sDiscussionService.getOrCreatePersonalChat([followerId]).subscribe(data => {
      // If chatting to a brand new user, include that in allPersonalChatUsers
      // Duplicates are added if done by .includes, hence this elaborate way of checking allPersonalChatUser id's
      const isThere = this.discussionFollowers.some(value => value.id === data.id);
      if (!isThere) {
        this.allPersonalChatUsers.unshift(data);
      }
      this.openChat(data);
    }));
  }

  // Open a chat based on the user clicked (event emitter from chats list component)
  openChat(follower: IDiscussionFollower) {
    // Add only if follower is not active
    // Duplicates are added if done by .includes, hence this elaborate way of checking discussionFollower id's
    const isThere = this.discussionFollowers.some(value => value.id === follower.id);
    if (!isThere) {
      // Check if length exceeds the maximum allowed windows
      if (this.discussionFollowers.length >= this.numChatWindows && this.discussionFollowers[0]) {
        // Unsubscribe the removed user
        this.userChatMessagesChannel.unsubscribe(this.discussionFollowers.shift().discussion_id);
      }
      // Insert into the back of the array
      this.discussionFollowers.push(follower);
    }
  }

  // Close and unsubscribe a particular chat
  closeChat(follower: IDiscussionFollower) {
    const index = this.discussionFollowers.indexOf(follower);
    this.userChatMessagesChannel.unsubscribe(follower.discussion_id);
    this.discussionFollowers.splice(index, 1);
  }

  // If there has been a new message and the user has seen it, remove the unread badge
  removeFromUnread(follower: IDiscussionFollower) {
    const index = this.allPersonalChatUsers.indexOf(follower);
    if (index > -1) {
      const unreadIndex = this.allPersonalChatUsers[index].unread_user_ids.findIndex(k => k === this.currentUser.id);
      this.allPersonalChatUsers[index].unread_user_ids.splice(unreadIndex, 1);
    }
  }

  // Move the recent message user to the top
  liveUpdates(value: IDiscussionFollower[]) {
    const index = this.allPersonalChatUsers.findIndex(k => k.id === value[0].id);
    if (index > -1) {
      this.allPersonalChatUsers.splice(index, 1);
    }
    this.allPersonalChatUsers.unshift(value[0]);
  }

}
