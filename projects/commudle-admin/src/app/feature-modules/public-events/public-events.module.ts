import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NbActionsModule,
  NbAlertModule,
  NbBadgeModule,
  NbButtonModule,
  NbCardModule,
  NbIconModule,
  NbInputModule,
  NbListModule,
  NbPopoverModule,
  NbTabsetModule,
  NbToggleModule,
  NbTooltipModule,
  NbUserModule
} from '@nebular/theme';
import { SharedComponentsModule } from 'projects/shared-components/shared-components.module';
import { SharedPipesModule } from 'projects/shared-pipes/pipes.module';
import { AgendaComponent } from './components/agenda/agenda.component';
import { EventLocationTracksComponent } from './components/agenda/event-location-tracks/event-location-tracks.component';
import { AttendingMembersComponent } from './components/attending-members/attending-members.component';
import { AutoAttendanceComponent } from './components/auto-attendance/auto-attendance.component';
import { CollaborationCommunitiesComponent } from './components/collaboration-communities/collaboration-communities.component';
import { EventDescriptionComponent } from './components/event-description/event-description.component';
import { EventUpdatesComponent } from './components/event-updates/event-updates.component';
import { HighlightedLinksComponent } from './components/highlighted-links/highlighted-links.component';
import { HomeEventComponent } from './components/home-event/home-event.component';
import { LiveSessionsComponent } from './components/live-sessions/live-sessions.component';
import { SessionPageDetailsComponent } from './components/session-page/session-page-details/session-page-details.component';
import { SessionPageChatComponent } from './components/session-page/session-page-video/session-page-chat/session-page-chat.component';
import { SessionPagePollComponent } from './components/session-page/session-page-video/session-page-poll/session-page-poll.component';
import { SessionPageQnaComponent } from './components/session-page/session-page-video/session-page-qna/session-page-qna.component';
import { SessionPageVideoComponent } from './components/session-page/session-page-video/session-page-video.component';
import { SessionPageViewersComponent } from './components/session-page/session-page-video/session-page-viewers/session-page-viewers.component';
import { SessionPageComponent } from './components/session-page/session-page.component';
import { SpeakerSessionPageComponent } from './components/speaker-session-page/speaker-session-page.component';
import { UsersListComponent } from './components/speaker-session-page/users-list/users-list.component';
import { SpeakersComponent } from './components/speakers/speakers.component';
import { SponsorsComponent } from './components/sponsors/sponsors.component';
import { TeamComponent } from './components/team/team.component';
import { PublicEventsRoutingModule } from './public-events-routing.module';

@NgModule({
  declarations: [
    HomeEventComponent,
    SpeakerSessionPageComponent,
    HighlightedLinksComponent,
    LiveSessionsComponent,
    AgendaComponent,
    SpeakersComponent,
    EventUpdatesComponent,
    EventDescriptionComponent,
    CollaborationCommunitiesComponent,
    TeamComponent,
    EventLocationTracksComponent,
    AttendingMembersComponent,
    AutoAttendanceComponent,
    SponsorsComponent,
    UsersListComponent,
    SessionPageComponent,
    SessionPageDetailsComponent,
    SessionPageVideoComponent,
    SessionPageChatComponent,
    SessionPageQnaComponent,
    SessionPagePollComponent,
    SessionPageViewersComponent
  ],
  imports: [
    CommonModule,
    PublicEventsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedComponentsModule,
    SharedPipesModule,

    // Nebular
    NbCardModule,
    NbListModule,
    NbInputModule,
    NbButtonModule,
    NbIconModule,
    NbTooltipModule,
    NbPopoverModule,
    NbTabsetModule,
    NbBadgeModule,
    NbAlertModule,
    NbActionsModule,
    NbUserModule,
    NbToggleModule
  ]
})
export class PublicEventsModule {
}
