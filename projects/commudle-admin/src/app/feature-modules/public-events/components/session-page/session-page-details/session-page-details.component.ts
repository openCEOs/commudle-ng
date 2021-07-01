import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { ICommunity } from 'projects/shared-models/community.model';
import { IEvent } from 'projects/shared-models/event.model';
import { ITrackSlot } from 'projects/shared-models/track-slot.model';
import { IUser } from 'projects/shared-models/user.model';

@Component({
  selector: 'app-session-page-details',
  templateUrl: './session-page-details.component.html',
  styleUrls: ['./session-page-details.component.scss']
})
export class SessionPageDetailsComponent implements OnInit {

  @Input() event: IEvent;
  @Input() community: ICommunity;
  @Input() trackSlot: ITrackSlot;
  @Input() speaker: IUser;
  @Input() userVisitData;
  @Input() startTime: Date;
  @Input() endTime: Date;

  @Output() openViewers: EventEmitter<any> = new EventEmitter<any>();

  moment = moment;

  constructor() {
  }

  ngOnInit(): void {
  }

}
