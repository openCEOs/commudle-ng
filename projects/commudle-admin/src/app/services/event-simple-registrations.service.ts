import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IEventSimpleRegistration } from 'projects/shared-models/event_simple_registration.model';
import { API_ROUTES } from 'projects/shared-services/api-routes.constants';
import { ApiRoutesService } from 'projects/shared-services/api-routes.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventSimpleRegistrationsService {

  constructor(
    private http: HttpClient,
    private apiRoutesService: ApiRoutesService
  ) {
  }

  findOrCreate(eventId): Observable<IEventSimpleRegistration> {
    const params = new HttpParams().set('event_id', eventId);
    return this.http.get<IEventSimpleRegistration>(
      this.apiRoutesService.getRoute(API_ROUTES.EVENT_SIMPLE_REGISTRATIONS.FIND_OR_CREATE), { params }
    );
  }

  toggleStatus(eventSimpleRegistrationId): Observable<IEventSimpleRegistration> {
    return this.http.put<IEventSimpleRegistration>(
      this.apiRoutesService.getRoute(API_ROUTES.EVENT_SIMPLE_REGISTRATIONS.TOGGLE_STATUS), {
        event_simple_registration_id: eventSimpleRegistrationId
      }
    );
  }

  emailCSV(eventId): Observable<boolean> {
    const params = new HttpParams().set('event_id', eventId);
    return this.http.get<boolean>(
      this.apiRoutesService.getRoute(API_ROUTES.EVENT_SIMPLE_REGISTRATIONS.EMAIL_CSV), { params }
    );
  }

  changeBulkRegistrationStatus(registrationStatusId, eventId, changeCanceledStatus): Observable<boolean> {
    return this.http.put<boolean>(
      this.apiRoutesService.getRoute(API_ROUTES.EVENT_SIMPLE_REGISTRATIONS.CHANGE_BULK_REGISTRATION_STATUS), {
        registration_status_id: registrationStatusId,
        event_id: eventId,
        canceled_change: changeCanceledStatus
      }
    );
  }

  pGet(eventId): Observable<IEventSimpleRegistration> {
    const params = new HttpParams().set('event_id', eventId);
    return this.http.get<IEventSimpleRegistration>(
      this.apiRoutesService.getRoute(API_ROUTES.EVENT_SIMPLE_REGISTRATIONS.PUBLIC.SHOW), { params }
    );
  }

}
