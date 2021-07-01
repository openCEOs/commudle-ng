import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { ICurrentUser } from 'projects/shared-models/current_user.model';
import { IHmsClient } from 'projects/shared-modules/hms-video/models/hms-client.model';
import { LibAuthwatchService } from 'projects/shared-services/lib-authwatch.service';
import { combineLatest, Subscription } from 'rxjs';
import { HmsClientManagerService } from '../../services/hms-client-manager.service';
import { EHmsStates, HmsVideoStateService } from '../../services/hms-video-state.service';
import { LocalmediaService } from '../../services/localmedia.service';
import { HmsLiveChannel } from '../../services/websockets/hms-live.channel';
import { EHmsRoles } from '../enums/hms-roles.enum';

@Component({
  selector: 'app-conference',
  templateUrl: './conference.component.html',
  styleUrls: ['./conference.component.scss']
})
export class ConferenceComponent implements OnInit, OnDestroy {

  @Input() roomId: string;
  @Input() serverClient: IHmsClient;
  @Input() client: any;
  @Input() selectedRole: EHmsRoles;

  subscriptions: Subscription[] = [];
  EHmsRoles = EHmsRoles;

  user: ICurrentUser;
  loading = true;

  showSettings = false;
  onStage = false;

  audioDevice: MediaDeviceInfo;
  videoDevice: MediaDeviceInfo;
  mic: boolean;
  camera: boolean;
  screenShare = false;

  // streams
  localStream;
  localScreen;

  // list of all the peers in the room
  peers = {};
  streams = {};

  numVids = 0;

  screenShareStream = null;

  location = location;

  @ViewChild('userDisconnectedAlert') userDisconnectedAlert: TemplateRef<any>;

  constructor(
    private libAuthWatchService: LibAuthwatchService,
    private hmsClientManagerService: HmsClientManagerService,
    private localMediaService: LocalmediaService,
    private hmsLiveChannel: HmsLiveChannel,
    private hmsVideoStateService: HmsVideoStateService,
    private dialogService: NbDialogService
  ) {
  }

  ngOnDestroy() {
    this.endAllStreams();
    this.subscriptions.forEach(value => value.unsubscribe());
  }

  ngOnInit(): void {
    // setup the preselected devices
    const deviceListener = combineLatest([
      this.localMediaService.selectedAudioDevice$,
      this.localMediaService.selectedVideoDevice$,
      this.localMediaService.mic$,
      this.localMediaService.camera$
    ]);

    deviceListener.subscribe(data => {
      this.audioDevice = data[0];
      this.videoDevice = data[1];
      this.mic = data[2];
      this.camera = data[3];

      if (this.localStream) {
        this.modifyLocalStream(this.localStream);
      }

      this.updateCamera();
      this.updateMic();

      // modify stream if the client is present (this will get changed from the settings component)
    });


    // get currentUser
    this.libAuthWatchService.currentUser$.subscribe(data => this.user = data);

    this.setStage();

    // fetch the client token
    this.connectToClient();
  }

  setStage() {
    // put the user on the stage only if the selected role is a guest or
    if ([EHmsRoles.GUEST, EHmsRoles.HOST].includes(this.selectedRole)) {
      this.onStage = true;
    }
  }

  connectToClient() {
    // this.client = this.hmsClientManagerService.createClient(this.user.name, this.hmsClient.token);
    this.hmsClientManagerService.connectClient(this.client).subscribe(() => this.setupListeners());
  }

  setupListeners() {
    if (this.client) {
      // detect connection establish
      this.client.on('connect', () => {
        this.joinRoom();
      });

      // detect disconnect
      this.client.on('disconnect', () => {
      });

      // detect peer join
      this.client.on('peer-join', (room, peer) => {
        if (!this.peers[peer.uid]) {
          this.peers[peer.uid] = peer;
        }
      });

      // detect peer leave
      this.client.on('peer-leave', (room, peer) => {
        delete this.peers[peer.uid];
      });

      // display the peer's stream
      this.client.on('stream-add', (room, peer, streamInfo) => {
        this.addPeerStream(peer, streamInfo);
      });

      // remove the peer's stream
      this.client.on('stream-remove', (room, peer, streamInfo) => {
        // Remove remote stream if needed
        this.removeStream(streamInfo.mid);
      });

      // detect temporary socket disconnections
      this.client.on('disconnected', () => {
        this.dialogService.open(this.userDisconnectedAlert, {
          autoFocus: true,
          closeOnBackdropClick: false,
          closeOnEsc: false
        });
      });
    }
  }

  joinRoom() {
    this.hmsClientManagerService.joinRoom(this.client, this.roomId).subscribe(() => {
      this.updateConfStatus();
      this.receiveChannelData();
      if (this.onStage) {
        // get the local stream
        this.addLocalStream();
      }
    });
  }

  addLocalStream() {
    // get the local stream and the publish it to the room
    this.hmsClientManagerService.getLocalStream(this.client, this.audioDevice, this.videoDevice, this.mic, this.camera).subscribe(data => {
      this.localStream = data;
      this.toggleVideo(this.camera);
      this.toggleAudio(this.mic);
      // publish local stream to the room
      this.hmsClientManagerService.publishLocalStream(this.client, this.localStream, this.roomId).subscribe(value => {
        // TODO remove this interval
        const interval = setInterval(() => {
          if (this.localStream.mid) {
            this.onStage = true;
            this.updateStreams(this.client.uid, this.localStream.mid, value, this.localStream.options.screen);
            clearInterval(interval);
          }
        }, 1000);
      });
    });
  }

  modifyLocalStream(stream) {
    if (this.client) {
      this.client.applyConstraints({
        shouldPublishAudio: true,
        shouldPublishVideo: true,
        advancedMediaConstraints: {
          audio: {
            deviceId: this.audioDevice.deviceId
          },
          video: {
            deviceId: this.videoDevice.deviceId
          }
        }
      }, stream);
    }
  }

  removeLocalStream() {
    this.removeStream(this.localStream.mid);
    this.hmsClientManagerService.unpublishLocalStream(this.client, this.localStream, this.roomId).subscribe(() => {
      this.localStream = null;
    });
  }

  addLocalScreen() {
    this.hmsClientManagerService.getLocalScreen(this.client).subscribe(data => {
      this.localScreen = data;

      // publish local screen using the same method to the room
      this.hmsClientManagerService.publishLocalStream(this.client, this.localScreen, this.roomId).subscribe(value => {
        // TODO remove this interval
        const interval = setInterval(() => {
          if (value.mid) {
            clearInterval(interval);
            this.localScreen = value;
            this.screenShare = true;
            this.localScreen.getVideoTracks().forEach(track => {
              if ('contentHint' in track) {
                track.contentHint = 'text';
              }
            });

            const videoTrack = this.localScreen.getVideoTracks()[0];
            if (videoTrack) {
              videoTrack.addEventListener('ended', () => this.removeLocalScreen());
            }
            this.updateStreams(this.client.uid, this.localScreen.mid, value, this.localStream.options.screen);
          }
        }, 1000);
      });
    });
  }

  removeLocalScreen() {
    this.removeStream(this.localScreen.mid);
    this.hmsClientManagerService.unpublishLocalStream(this.client, this.localScreen, this.roomId).subscribe(() => {
      this.screenShare = false;
      this.localScreen = null;
    });
  }


  addPeerStream(peer, streamInfo) {
    this.hmsClientManagerService.getPeerStream(this.client, streamInfo.mid, this.roomId).subscribe(data => {
      if (!this.peers[peer.uid]) {
        this.peers[peer.uid] = peer;
      }
      this.updateStreams(peer.uid, streamInfo.mid, data, streamInfo.screen);
    });
  }


  updateStreams(uid, mid, stream, screen?) {
    this.streams[mid] = { uid, mid, stream };
    this.numVids = Object.keys(this.streams).length;
    if (screen || (stream.options && stream.options.screen)) {
      this.screenShareStream = mid;
    }
  }

  removeStream(mid) {
    if (this.screenShareStream === mid) {
      this.screenShareStream = null;
    }
    delete this.streams[mid];
    this.numVids = Object.keys(this.streams).length;
  }

  // CONTROLS
  toggleVideo(value: boolean) {
    this.camera = value;
    this.camera ? this.localStream.unmute('video') : this.localStream.mute('video');
    this.localMediaService.updateCamera(this.camera);
    this.updateCamera();
  }

  toggleAudio(value: boolean) {
    this.mic = value;
    this.mic ? this.localStream.unmute('audio') : this.localStream.mute('audio');
    this.localMediaService.updateMic(this.mic);
    this.updateMic();
  }

  toggleScreen() {
    !this.screenShare ? this.addLocalScreen() : this.removeLocalScreen();
  }

  toggleStage() {
    if (this.onStage) {
      this.removeLocalStream();
      if (this.localScreen) {
        this.removeLocalScreen();
      }
      this.onStage = !this.onStage;
    } else if (!this.showSettings) {
      this.showSettings = true;
    } else {
      this.addLocalStream();
      this.onStage = !this.onStage;
    }
  }

  confirmEndConference(dialog: TemplateRef<any>) {
    this.dialogService.open(dialog);
  }

  endConference() {
    // if user is a host
    if (this.serverClient.role === EHmsRoles.HOST) {
      this.hmsLiveChannel.sendData(
        this.hmsLiveChannel.ACTIONS.END_STREAM,
        this.client.uid,
        {}
      );
    }
    this.endAllStreams();
  }

  endAllStreams() {
    const unsubscribableStreams = [];

    if (this.localStream) {
      unsubscribableStreams.push(this.hmsClientManagerService.unpublishLocalStream(this.client, this.localStream, this.roomId));
    }

    if (this.localScreen) {
      unsubscribableStreams.push(this.hmsClientManagerService.unpublishLocalStream(this.client, this.localScreen, this.roomId));
    }

    const unsubscribeStreams = combineLatest(unsubscribableStreams);
    this.hmsVideoStateService.setState(EHmsStates.ENDED);

    unsubscribeStreams.subscribe(() => {
      // disconnect the client
      this.hmsClientManagerService.disconnectClient(this.client);    // if user is a viewer or a guest
    }, error => {
      console.log('ERROR IN DISCONNECTING', error);
    });
  }

  // HMS Live Channel
  updateConfStatus() {
    this.hmsLiveChannel.sendData(
      this.hmsLiveChannel.ACTIONS.UPDATE_STATUS,
      this.client.uid,
      {
        status: this.hmsVideoStateService.states.ROOM
      }
    );

    this.updateCamera();
    this.updateMic();
  }

  updateCamera() {
    this.hmsLiveChannel.sendData(
      this.hmsLiveChannel.ACTIONS.UPDATE_CAMERA,
      this.client.uid,
      {
        camera: this.camera
      }
    );
  }

  updateMic() {
    this.hmsLiveChannel.sendData(
      this.hmsLiveChannel.ACTIONS.UPDATE_MIC,
      this.client.uid,
      {
        mic: this.mic
      }
    );
  }


  receiveChannelData() {
    const receiveDataSubscription = this.hmsLiveChannel.channelData$[this.client.uid].subscribe(data => {
      if (data.uid && !this.peers[data.uid]) {
        this.peers[data.uid] = {};
      }
      switch (data.action) {
        case this.hmsLiveChannel.ACTIONS.EXISTING_USER: {
          this.peers[data.uid].user = data.user;
        }
          break;
        case this.hmsLiveChannel.ACTIONS.UPDATE_USER: {
          // do not update self user
          this.peers[data.uid].user = data.user;
        }
          break;
        case this.hmsLiveChannel.ACTIONS.INVITE_TO_STAGE: {
          if (!this.onStage) {
            this.toggleStage();
          }
        }
          break;
        case this.hmsLiveChannel.ACTIONS.MUTE_PEER: {
          if (this.mic) {
            this.toggleAudio(false);
          }
        }
          break;
        case this.hmsLiveChannel.ACTIONS.REMOVE_FROM_STAGE: {
          if (this.onStage) {
            this.toggleStage();
          }
        }
          break;
        case this.hmsLiveChannel.ACTIONS.END_STREAM: {
          this.endAllStreams();
        }
          break;
      }
    });

    this.subscriptions.push(receiveDataSubscription);
  }


  // admin controls from hms live channel
  mutePeer(uid) {
    this.hmsLiveChannel.sendData(
      this.hmsLiveChannel.ACTIONS.MUTE_PEER,
      this.client.uid,
      { uid }
    );
  }

  removePeerFromStage(uid) {
    this.hmsLiveChannel.sendData(
      this.hmsLiveChannel.ACTIONS.REMOVE_FROM_STAGE,
      this.client.uid,
      { uid }
    );
  }

}
