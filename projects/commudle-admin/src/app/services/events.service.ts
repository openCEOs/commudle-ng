import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IEvent } from 'projects/shared-models/event.model';
import { IEventStatus } from 'projects/shared-models/event_status.model';
import { IEvents } from 'projects/shared-models/events.model';
import { IPolls } from 'projects/shared-models/polls.model';
import { IUsers } from 'projects/shared-models/users.model';
import { API_ROUTES } from 'projects/shared-services/api-routes.constants';
import { ApiRoutesService } from 'projects/shared-services/api-routes.service';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class EventsService {

  constructor(
    private http: HttpClient,
    private apiRoutesService: ApiRoutesService
  ) {
  }

  updateEvent(event, eventId, community): Observable<IEvent> {
    return this.http.put<IEvent>(
      this.apiRoutesService.getRoute(API_ROUTES.EVENTS.UPDATE),
      {
        event,
        community_id: community.id,
        event_id: eventId
      }
    );
  }

  createEvent(event, community): Observable<IEvent> {
    return this.http.post<IEvent>(
      this.apiRoutesService.getRoute(API_ROUTES.EVENTS.CREATE),
      {
        event,
        community_id: community.id
      }
    );
  }

  communityEventsForEmail(communityId): Observable<IEvents> {
    const params = new HttpParams().set('community_id', communityId);
    return this.http.get<IEvents>(
      this.apiRoutesService.getRoute(API_ROUTES.EVENTS.COMMUNITY_EVENTS_FOR_EMAIL), { params }
    );
  }

  getEvent(eventId): Observable<IEvent> {
    const params = new HttpParams().set('event_id', eventId);
    return this.http.get<IEvent>(
      this.apiRoutesService.getRoute(API_ROUTES.EVENTS.GET), { params }
    );
  }

  updateStatus(eventId, eventStatus): Observable<IEventStatus> {
    return this.http.put<IEventStatus>(
      this.apiRoutesService.getRoute(API_ROUTES.EVENTS.UPDATE_STATUS), {
        event_id: eventId,
        event_status: eventStatus
      }
    );
  }

  updateCustomRegistration(eventId, customRegistration): Observable<IEvent> {
    return this.http.put<IEvent>(
      this.apiRoutesService.getRoute(API_ROUTES.EVENTS.UPDATE_CUSTOM_REGISTRATION), {
        event_id: eventId,
        custom_registration: customRegistration
      }
    );
  }

  updateCustomAgenda(eventId, customAgenda): Observable<IEvent> {
    return this.http.put<IEvent>(
      this.apiRoutesService.getRoute(API_ROUTES.EVENTS.UPDATE_CUSTOM_AGENDA), {
        event_id: eventId,
        custom_agenda: customAgenda
      }
    );
  }

  updateHeaderImage(eventId, formData): Observable<IEvent> {
    const params = new HttpParams().set('event_id', eventId);
    return this.http.put<IEvent>(
      this.apiRoutesService.getRoute(API_ROUTES.EVENTS.UPDATE_HEADER_IMAGE), formData, { params }
    );
  }

  deleteHeaderImage(eventId): Observable<IEvent> {
    const params = new HttpParams().set('event_id', eventId);
    return this.http.delete<IEvent>(
      this.apiRoutesService.getRoute(API_ROUTES.EVENTS.DELETE_HEADER_IMAGE), { params });
  }


  embeddedVideoStreamPastVisitors(eventId, embeddedVideoStreamId): Observable<IUsers> {
    const params = new HttpParams().set('event_id', eventId).set('embedded_video_stream_id', embeddedVideoStreamId);
    return this.http.get<IUsers>(
      this.apiRoutesService.getRoute(API_ROUTES.EVENTS.EMBEDDED_VIDEO_STREAM_PAST_VISITORS), { params });
  }

  inviteGuestToWebinarStage(userId, hmsRoomId): Observable<any> {
    return this.http.post<any>(
      this.apiRoutesService.getRoute(API_ROUTES.EVENTS.INVITE_GUEST_TO_WEBINAR_STAGE),
      {
        user_id: userId,
        hms_room_id: hmsRoomId
      }
    );
  }

  pGetUpcomingEvents(): Observable<IEvents> {
    return this.http.get<IEvents>(
      this.apiRoutesService.getRoute(API_ROUTES.EVENTS.PUBLIC.UPCOMING)
    );
  }

  pGetRandomPastEvents(count): Observable<IEvents> {
    const params = new HttpParams().set('count', count);
    return this.http.get<IEvents>(
      this.apiRoutesService.getRoute(API_ROUTES.EVENTS.PUBLIC.RANDOM_PAST), { params }
    );
  }

  pGetCommunityEvents(communityId): Observable<IEvents> {
    const params = new HttpParams().set('community_id', communityId);
    return this.http.get<IEvents>(
      this.apiRoutesService.getRoute(API_ROUTES.EVENTS.PUBLIC.INDEX_BY_COMMUNITY), { params }
    );
  }

  pGetEvent(eventId): Observable<IEvent> {
    const params = new HttpParams().set('event_id', eventId);
    return this.http.get<IEvent>(
      this.apiRoutesService.getRoute(API_ROUTES.EVENTS.PUBLIC.GET), { params }
    );
  }

  pGetEventVolunteers(eventId): Observable<IUsers> {
    const params = new HttpParams().set('event_id', eventId);
    return this.http.get<IUsers>(
      this.apiRoutesService.getRoute(API_ROUTES.EVENTS.PUBLIC.VOLUNTEERS), { params }
    );
  }

  getPolls(eventId: number): Observable<IPolls> {
    const params = new HttpParams().set('event_id', String(eventId));
    return this.http.get<IPolls>(
      this.apiRoutesService.getRoute(API_ROUTES.EVENTS.PUBLIC.POLLS), { params }
    );
  }

}
