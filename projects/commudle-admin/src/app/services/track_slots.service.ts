import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPolls } from 'projects/shared-models/polls.model';
import { ITrackSlot } from 'projects/shared-models/track-slot.model';
import { ITrackSlots } from 'projects/shared-models/track_slots.model';
import { API_ROUTES } from 'projects/shared-services/api-routes.constants';
import { ApiRoutesService } from 'projects/shared-services/api-routes.service';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class TrackSlotsService {

  constructor(
    private http: HttpClient,
    private apiRoutesService: ApiRoutesService
  ) {
  }

  createTrackSlot(newTrackSlot): Observable<ITrackSlot> {
    return this.http.post<ITrackSlot>(
      this.apiRoutesService.getRoute(API_ROUTES.TRACK_SLOTS.CREATE),
      {
        track_slot: newTrackSlot
      }
    );
  }

  updateTrackSlot(trackSlot, trackSlotId): Observable<ITrackSlot> {

    return this.http.put<ITrackSlot>(
      this.apiRoutesService.getRoute(API_ROUTES.TRACK_SLOTS.UPDATE),
      {
        track_slot: trackSlot,
        track_slot_id: trackSlotId
      }
    );
  }

  deleteTrackSlot(trackSlotId): Observable<any> {
    const params = new HttpParams().set('track_slot_id', trackSlotId);
    return this.http.delete<any>(
      this.apiRoutesService.getRoute(API_ROUTES.TRACK_SLOTS.DELETE), { params }
    );
  }

  // PUBLIC METHODS
  pGetTrackSlot(trackSlotId): Observable<ITrackSlot> {
    const params = new HttpParams().set('track_slot_id', trackSlotId);
    return this.http.get<any>(
      this.apiRoutesService.getRoute(API_ROUTES.TRACK_SLOTS.PUBLIC.GET), { params }
    );
  }

  pToggleVote(trackSlotId): Observable<number> {
    return this.http.post<any>(
      this.apiRoutesService.getRoute(API_ROUTES.TRACK_SLOTS.PUBLIC.TOGGLE_VOTE), { track_slot_id: trackSlotId }
    );
  }

  pGetLiveEventSessions(eventId): Observable<ITrackSlots> {
    const params = new HttpParams().set('event_id', eventId);
    return this.http.get<ITrackSlots>(
      this.apiRoutesService.getRoute(API_ROUTES.TRACK_SLOTS.PUBLIC.LIVE_EVENT_SESSIONS), { params }
    );
  }

  getPolls(trackSlotId: number): Observable<IPolls> {
    const params = new HttpParams().set('track_slot_id', String(trackSlotId));
    return this.http.get<IPolls>(
      this.apiRoutesService.getRoute(API_ROUTES.TRACK_SLOTS.PUBLIC.POLLS), { params }
    );
  }

}
