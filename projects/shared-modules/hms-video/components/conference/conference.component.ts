import { HMSClient } from '@100mslive/hmsvideo-web';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { LibAuthwatchService } from 'projects/shared-services/lib-authwatch.service';
import { ICurrentUser } from 'projects/shared-models/current_user.model';
import { LocalmediaService } from '../../services/localmedia.service';
import { combineLatest } from 'rxjs';
import { HmsLiveChannel } from '../../services/websockets/hms-live.channel';
import { IHmsClient } from 'projects/shared-modules/hms-video/models/hms-client.model';
import { HmsClientManagerService } from '../../services/hms-client-manager.service';
import { EHmsRoles } from '../enums/hms-roles.enum';
import { HmsVideoStateService } from '../../services/hms-video-state.service';

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
  subscriptions = [];
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


  constructor(
    private libAuthWatchService: LibAuthwatchService,
    private hmsClientManagerService: HmsClientManagerService,
    private localMediaService: LocalmediaService,
    private hmsLiveChannel: HmsLiveChannel,
    private hmsVideoStateService: HmsVideoStateService
  ) { }

  ngOnDestroy() {
    if (this.client) {
      this.client.disconnect();
    }

    for (let subs of this.subscriptions) {
      subs.unsubscribe();
    }

  }

  ngOnInit(): void {
    // setup the preselected devices
    const deviceListener =  combineLatest([
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
    this.libAuthWatchService.currentUser$.subscribe(
      data => {
        this.user = data;
      }
    )

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
    this.hmsClientManagerService.connectClient(this.client).subscribe(
      data => {
        this.setupListeners();
      }
    )
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
      })

      // detect peer leave
      this.client.on('peer-leave', (room, peer) => {
        delete this.peers[peer.uid];
      });

      // display the peer's stream
      this.client.on('stream-add', (room,  peer, streamInfo) => {
        this.addPeerStream(peer, streamInfo.mid);
      });

      // remove the peer's stream
      this.client.on('stream-remove', (room, peer, streamInfo) => {
          // Remove remote stream if needed
          delete this.streams[streamInfo.mid];
      });

      // detect temporary socket disconnections
      this.client.on('disconnected', () => {
        // probably reload the page
      });
    }

  }

  joinRoom() {
    this.hmsClientManagerService.joinRoom(this.client, this.roomId).subscribe(
      data => {
        this.updateConfStatus();
        this.receiveChannelData();
        if (this.onStage) {
          // get the localstream
          this.addLocalStream();
        }
      }
    );
  }

  addLocalStream() {
    // get the local stream and the publish it to the room
    this.hmsClientManagerService.getLocalStream(this.client, this.audioDevice, this.videoDevice, this.mic, this.camera).subscribe(
      data => {
        this.localStream = data;
        // publish localstream to the room
        this.hmsClientManagerService.publishLocalStream(this.client, this.localStream, this.roomId).subscribe(
          data => {

            // TODO remove this interval
            let interval = setInterval(() => {
              if (this.localStream.mid) {
                this.onStage = true;
                this.updateStreams(this.client.uid, this.localStream.mid, data);
                clearInterval(interval);
              }
            }, 1000);
          }
        );
      }
    )
  }

  modifyLocalStream(stream) {
    if (this.client) {
      this.client.applyConstraints({
        shouldPublishAudio: this.mic,
        shouldPublishVideo: this.camera,
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
    delete this.streams[this.localStream.mid];
    this.hmsClientManagerService.unpublishLocalStream(this.client, this.localStream, this.roomId).subscribe(
      data => {
        this.localStream = null;
      }
    );
  }


  addLocalScreen() {
    this.hmsClientManagerService.getLocalScreen(this.client).subscribe(
      data => {
        this.localScreen = data;

        // publish localscreen using the same method to the room
        this.hmsClientManagerService.publishLocalStream(this.client, this.localScreen, this.roomId).subscribe(
          data => {


            // TODO remove this interval
            let interval = setInterval(() => {
              if (data.mid) {
                clearInterval(interval);
                this.localScreen = data;
                this.screenShare = true;
                this.localScreen.getVideoTracks().forEach(track => {
                  if ('contentHint' in track) {
                    track.contentHint = 'text';
                  }
                });

                let track = this.localScreen.getVideoTracks()[0];
                if (track) {
                  track.addEventListener('ended', () => {
                    this.removeLocalScreen();
                  });
                }
                this.updateStreams(this.client.uid, this.localScreen.mid, data);
              }
            }, 1000);


          }
        );
      }
    )
  }


  removeLocalScreen() {
    delete this.streams[this.localScreen.mid];
    this.hmsClientManagerService.unpublishLocalStream(this.client, this.localScreen, this.roomId).subscribe(
      data => {
        this.screenShare = false;
        console.log('STREAMS', this.streams);
        this.localScreen = null;

      }
    );
  }


  addPeerStream(peer, mId) {
    this.hmsClientManagerService.getPeerStream(this.client, mId, this.roomId).subscribe(
      data => {
        if (!this.peers[peer.uid]) {
          this.peers[peer.uid] = peer
        }
        this.updateStreams(peer.uid, mId, data);
      }
    )
  }

  // this method is for the admin to be able to remove the stream of a peer
  removePeerStream(uid, stream, roomId) {

    // find the peer, find the stream and remove it
  }

  updateStreams(uid, mid, stream) {
    this.streams[mid] = {uid, mid, stream};
  }



  // CONTROLS
  toggleVideo() {
    this.camera = !this.camera;
    this.camera ? this.localStream.unmute('video') : this.localStream.mute('video');
    this.localMediaService.updateCamera(this.camera);
    this.updateCamera();
  }

  toggleAudio() {
    this.mic = !this.mic;
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
    } else {
      if (!this.showSettings) {
        this.showSettings = true;
      } else {
        this.addLocalStream();
        this.onStage = !this.onStage;
      }
    }
  }

  endConference() {
    // show a notification popup
  }




  // HMS Live Channel
  updateConfStatus() {
    this.hmsLiveChannel.sendData(
      this.hmsLiveChannel.ACTIONS.UPDATE_STATUS,
      this.client.uid,
      {
        status: this.hmsVideoStateService.states.ROOM
      }
    )

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
    )
  }

  updateMic() {
    this.hmsLiveChannel.sendData(
      this.hmsLiveChannel.ACTIONS.UPDATE_MIC,
      this.client.uid,
      {
        mic: this.mic
      }
    )
  }



  receiveChannelData() {
    const receiveDataSubscription = this.hmsLiveChannel.channelData$[this.client.uid].subscribe(
      data => {
        console.log('RECEIVED', data);
        if (data.uid && !this.peers[data.uid]) {
          this.peers[data.uid] = {};
        }
        switch (data.action) {
          case this.hmsLiveChannel.ACTIONS.EXISTING_USER: {
            this.peers[data.uid].user = data.user
          }
          break;
          case this.hmsLiveChannel.ACTIONS.UPDATE_USER: {
            // do not update self user
            this.peers[data.uid].user = data.user
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
              this.toggleAudio();
            }
          }
          break;
          case this.hmsLiveChannel.ACTIONS.REMOVE_FROM_STAGE: {
            if (this.onStage) {
              this.toggleStage();
            }
          }
          break;
        }
      }
    )

    this.subscriptions.push(receiveDataSubscription);
  }


  // admin controls from hms live channel
  mutePeer(uid) {
    this.hmsLiveChannel.sendData(
      this.hmsLiveChannel.ACTIONS.MUTE_PEER,
      this.client.uid,
      {uid}
    )
  }

  removePeerFromStage(uid) {
    this.hmsLiveChannel.sendData(
      this.hmsLiveChannel.ACTIONS.REMOVE_FROM_STAGE,
      this.client.uid,
      {uid}
    )
  }

}
