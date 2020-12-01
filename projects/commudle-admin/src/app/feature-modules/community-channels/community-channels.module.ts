import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunityChannelsDashboardComponent } from './components/community-channels-dashboard/community-channels-dashboard.component';
import { CommunityChannelsRoutingModule } from './community-channels-routing.module';
import { CommunityListComponent } from './components/community-list/community-list.component';
import { CommunityChannelFormComponent } from './components/community-channel-form/community-channel-form.component';
import { CommunityChannelListComponent } from './components/community-channel-list/community-channel-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NbButtonModule,
  NbCardModule,
  NbDialogModule,
  NbIconModule,
  NbInputModule,
  NbCheckboxModule } from '@nebular/theme';
import { ChannelSettingsComponent } from './components/channel-settings/channel-settings.component';
import { EditChannelComponent } from './components/channel-settings/edit-channel/edit-channel.component';
import { DiscussionCommunityChannelComponent } from './components/discussion-community-channel/discussion-community-channel.component';
import { CommunityChannelMessageComponent } from './components/discussion-community-channel/community-channel-message/community-channel-message.component';
import { CommunityChannelComponent } from './components/community-channel/community-channel.component';
import { SendMessageFormComponent } from './components/discussion-community-channel/send-message-form/send-message-form.component';
import { InviteFormComponent } from './components/channel-settings/invite-form/invite-form.component';



@NgModule({
  declarations: [
    CommunityChannelsDashboardComponent,
    CommunityListComponent,
    CommunityChannelFormComponent,
    CommunityChannelListComponent,
    ChannelSettingsComponent,
    EditChannelComponent,
    DiscussionCommunityChannelComponent,
    CommunityChannelMessageComponent,
    CommunityChannelComponent,
    SendMessageFormComponent,
    InviteFormComponent,
  ],
  imports: [
    CommonModule,
    CommunityChannelsRoutingModule,
    ReactiveFormsModule,
    FormsModule,

    // nebular
    NbInputModule,
    NbButtonModule,
    NbIconModule,
    NbCardModule,
    NbCheckboxModule,
    NbDialogModule.forChild(),
  ],
  exports: [
    CommunityChannelsDashboardComponent
  ]
})
export class CommunityChannelsModule { }