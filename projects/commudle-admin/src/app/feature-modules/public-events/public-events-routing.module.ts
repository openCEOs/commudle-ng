import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeEventComponent} from './components/home-event/home-event.component';
import {SessionPageComponent} from './components/session-page/session-page.component';
import {SpeakerSessionPageComponent} from './components/speaker-session-page/speaker-session-page.component';
import {CommunityDetailsResolver} from 'projects/commudle-admin/src/app/resolvers/community-details.resolver';
import {PublicEventDetailsResolver} from 'projects/commudle-admin/src/app/resolvers/public-event-details.resolver';


const routes: Routes = [
  {
    path: '',
    resolve: {
      community: CommunityDetailsResolver,
      event: PublicEventDetailsResolver
    },
    children: [
      {
        path: '',
        component: HomeEventComponent
      },
      {
        path: 'session',
        component: SessionPageComponent
      },
      {
        path: 'session-old',
        component: SpeakerSessionPageComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicEventsRoutingModule {
}
