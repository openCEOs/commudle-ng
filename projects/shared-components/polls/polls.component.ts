import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NbWindowService } from '@nebular/theme';
import { EventsService } from 'projects/commudle-admin/src/app/services/events.service';
import { TrackSlotsService } from 'projects/commudle-admin/src/app/services/track_slots.service';
import { ICurrentUser } from 'projects/shared-models/current_user.model';
import { EPollStatuses, IPoll } from 'projects/shared-models/poll.model';
import { LibAuthwatchService } from 'projects/shared-services/lib-authwatch.service';
import { LibToastLogService } from 'projects/shared-services/lib-toastlog.service';
import { PollsChannel } from '../services/websockets/polls.channel';

@Component({
  selector: 'app-polls',
  templateUrl: './polls.component.html',
  styleUrls: ['./polls.component.scss']
})
export class PollsComponent implements OnInit, OnDestroy {

  @ViewChild('newPollTemplate') newPollTemplate: TemplateRef<any>;
  @ViewChild('fillPollTemplate') fillPollTemplate: TemplateRef<any>;

  @Input() pollableId: number;
  @Input() pollableType: string;

  allActions;
  currentUser: ICurrentUser;
  polls: IPoll[] = [];
  permittedActions = [];

  selectedPoll: IPoll;

  windowRefCreatePoll;
  windowRefFillPoll;

  constructor(
    private pollsChannel: PollsChannel,
    private toastLogService: LibToastLogService,
    private authWatchService: LibAuthwatchService,
    private windowService: NbWindowService,
    private eventsService: EventsService,
    private trackSlotsService: TrackSlotsService
  ) {
  }

  login() {
    if (!this.currentUser) {
      this.authWatchService.logInUser();
    }
    return true;
  }

  ngOnInit() {
    this.authWatchService.currentUser$.subscribe(user => this.currentUser = user);

    this.allActions = this.pollsChannel.ACTIONS;
    this.pollsChannel.subscribe(this.pollableType, this.pollableId);
    this.receiveData();
  }

  ngOnDestroy(): void {
    this.pollsChannel.unsubscribe();
  }

  newPoll() {
    this.windowRefCreatePoll = this.windowService.open(this.newPollTemplate, { title: `New Poll` });
  }

  receiveData() {
    this.pollsChannel.channelData$.subscribe(
      data => {
        if (data) {
          switch (data.action) {
            case (this.pollsChannel.ACTIONS.SET_PERMISSIONS): {
              this.permittedActions = data.permitted_actions;
              this.getPolls();
              break;
            }
            case (this.pollsChannel.ACTIONS.CREATE): {
              if (this.windowRefCreatePoll) {
                this.windowRefCreatePoll.close();
              }
              const pollExists = this.polls.findIndex(p => p.id === data.poll.id);
              if (pollExists === -1) {
                this.polls.unshift(data.poll);
              }
              break;
            }
            case (this.pollsChannel.ACTIONS.START): {
              const pollIndex = this.polls.findIndex(p => p.id === data.poll.id);
              if (this.polls[pollIndex].status !== EPollStatuses.OPEN) {
                this.polls[pollIndex].status = EPollStatuses.OPEN;
                this.selectedPoll = data.poll;
                if (this.currentUser && !this.polls[pollIndex].already_filled) {
                  this.windowRefFillPoll = this.windowService.open(this.fillPollTemplate, { title: `Poll!` });
                }
              }

              break;
            }
            case (this.pollsChannel.ACTIONS.START_SELF): {
              const pollIndex = this.polls.findIndex(p => p.id === data.poll.id);
              this.polls[pollIndex].status = EPollStatuses.OPEN;
              this.selectedPoll = data.poll;
              if (this.currentUser && !this.polls[pollIndex].already_filled) {
                this.windowRefFillPoll = this.windowService.open(this.fillPollTemplate, { title: `Poll!` });
              }
              break;
            }
            case (this.pollsChannel.ACTIONS.STOP): {
              this.polls[this.polls.findIndex(p => p.id === data.poll_id)].status = EPollStatuses.CLOSED;
              if (this.windowRefFillPoll) {
                this.windowRefFillPoll.close();
              }
              break;
            }
            case (this.pollsChannel.ACTIONS.DELETE): {
              this.polls.splice(this.polls.findIndex(p => p.id === data.poll_id), 1);
              break;
            }
            case (this.pollsChannel.ACTIONS.FILL): {
              this.polls[this.polls.findIndex(p => p.id === data.poll_id)].already_filled = true;
              this.windowRefFillPoll.close();
              break;
            }
            case (this.pollsChannel.ACTIONS.FILL_COUNT): {
              this.polls[this.polls.findIndex(p => p.id === data.poll_id)].total_responses = data.fill_count;
              break;
            }
            case (this.pollsChannel.ACTIONS.ERROR): {
              this.toastLogService.warningDialog(data.message, 2000);
              break;
            }
          }
        }
      }
    );
  }

  getPolls() {
    if (this.pollableType === 'Event') {
      this.eventsService.getPolls(this.pollableId).subscribe(value => this.polls = value.polls);
    } else {
      this.trackSlotsService.getPolls(this.pollableId).subscribe(value => this.polls = value.polls);
    }
  }

  create(pollData) {
    this.pollsChannel.sendData(
      this.pollsChannel.ACTIONS.CREATE,
      {
        poll: pollData,
        pollable_type: this.pollableType,
        pollable_id: this.pollableId
      }
    );
  }

  startPoll(pollId) {
    this.pollsChannel.sendData(
      this.pollsChannel.ACTIONS.START,
      {
        poll_id: pollId
      }
    );
  }

  startSelf(pollId) {
    this.pollsChannel.sendData(
      this.pollsChannel.ACTIONS.START_SELF,
      {
        poll_id: pollId
      }
    );
  }


  submitPoll(pollData) {
    this.pollsChannel.sendData(
      this.pollsChannel.ACTIONS.FILL,
      {
        poll_id: this.selectedPoll.id,
        poll: pollData
      }
    );
  }

  stopPoll(pollId) {
    this.pollsChannel.sendData(
      this.pollsChannel.ACTIONS.STOP,
      {
        poll_id: pollId
      }
    );
  }

  deletePoll(pollId) {
    this.pollsChannel.sendData(
      this.pollsChannel.ACTIONS.DELETE,
      {
        poll_id: pollId
      }
    );
  }

}
