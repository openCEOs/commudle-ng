import { DOCUMENT } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import * as moment from 'moment';
import { ICommunity } from 'projects/shared-models/community.model';
import { ICurrentUser } from 'projects/shared-models/current_user.model';
import { IDiscussion } from 'projects/shared-models/discussion.model';
import { IEmbeddedVideoStream } from 'projects/shared-models/embedded_video_stream.model';
import { EUserRoles } from 'projects/shared-models/enums/user_roles.enum';
import { IEvent } from 'projects/shared-models/event.model';
import { ITrackSlot } from 'projects/shared-models/track-slot.model';
import { IUser } from 'projects/shared-models/user.model';

@Component({
  selector: 'app-session-page-video',
  templateUrl: './session-page-video.component.html',
  styleUrls: ['./session-page-video.component.scss']
})
export class SessionPageVideoComponent implements OnInit, AfterViewInit {

  @Input() event: IEvent;
  @Input() userRoles: any[];
  @Input() currentUser: ICurrentUser;
  @Input() embeddedVideoStream: IEmbeddedVideoStream;
  @Input() startTime: Date;
  @Input() endTime: Date;
  @Input() chat: IDiscussion;
  @Input() qna: IDiscussion;
  @Input() pollableId: number;
  @Input() pollableType: string;
  @Input() community: ICommunity;
  @Input() trackSlot: ITrackSlot;
  @Input() speaker: IUser;
  @Input() userVisitData;

  moment = moment;
  EUserRoles = EUserRoles;

  isFullScreen = false;
  compressVideoStream = false;

  // For live notifications
  userCount = 0;
  newMessage = false;
  newQna = false;
  newPoll = false;

  @ViewChildren('interactionWindow') interactionWindows: QueryList<ElementRef>;

  constructor(
    @Inject(DOCUMENT) private document: any,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (['commudle', 'youtube'].includes(this.embeddedVideoStream.source)) {
      this.toggleInteractionWindow(0);
      this.cdr.detectChanges();
    }
  }

  toggleFullScreen(): void {
    if (this.isFullScreen) {
      this.document.exitFullscreen();
    } else {
      this.document.documentElement.requestFullscreen();
    }
    this.isFullScreen = !this.isFullScreen;
  }

  toggleInteractionWindow(windowNum: number): void {
    this.interactionWindows.forEach((item, index) => {
      item.nativeElement.style.display = windowNum === index ? item.nativeElement.style.display === 'block' ? 'none' : 'block' : 'none';
    });
    this.compressVideoStream = this.interactionWindows.some(value => value.nativeElement.style.display === 'block');
    switch (windowNum) {
      case 2:
        this.newMessage = false;
        break;
      case 3:
        this.newQna = false;
        break;
      case 4:
        this.newPoll = false;
        break;
    }
  }

  getInteractionWindowStatus(windowNum: number): boolean {
    return this.interactionWindows.toArray()[windowNum].nativeElement.style.display === 'none';
  }

}
