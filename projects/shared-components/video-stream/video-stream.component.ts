import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, Input, OnChanges, OnInit, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'projects/commudle-admin/src/environments/environment';
import { ICurrentUser } from 'projects/shared-models/current_user.model';
import { EEmbeddedVideoStreamSources } from 'projects/shared-models/enums/embedded_video_stream_sources.enum';

@Component({
  selector: 'app-video-stream',
  templateUrl: './video-stream.component.html',
  styleUrls: ['./video-stream.component.scss']
})
export class VideoStreamComponent implements OnInit, OnChanges {

  @Input() started: boolean;
  @Input() currentUser: ICurrentUser;
  @Input() videoSource: string;
  @Input() videoCode: any;
  @Input() fillerText: string;
  @Input() width: number;
  @Input() height: number;
  @Input() userEmail: string;
  @Input() userName: string;
  // zoom specific attributes
  @Input() zoomSignature: string;
  @Input() zoomHostEmail: string;
  @Input() zoomPassword: string;
  @Input() zoomHostSignature: string;
  // hms specific attributes
  @Input() hmsRoomId: string;

  isBrowser: boolean = isPlatformBrowser(this.platformId);
  api;
  EEmbeddedVideoStreamSources = EEmbeddedVideoStreamSources;
  environment = environment;
  playerUrl: any;

  constructor(
    private sanitizer: DomSanitizer,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
  }

  ngOnInit() {
    this.setPreview();
    if (!this.fillerText) {
      this.fillerText = 'Loading...';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setPreview();
  }

  setPreview() {
    if (this.videoCode) {
      switch (this.videoSource) {
        case EEmbeddedVideoStreamSources.COMMUDLE:
          this.changeDetectorRef.detectChanges();
          break;
        case EEmbeddedVideoStreamSources.YOUTUBE:
          this.youtubeParser();
          break;
        case EEmbeddedVideoStreamSources.ZOOM:
          this.playerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.createZoomUrl());
          break;
        case EEmbeddedVideoStreamSources.EXTERNAL_LINK:
          this.playerUrl = this.videoCode;
          break;
        default: // for other embeds
          this.playerUrl = this.sanitizer.bypassSecurityTrustHtml(this.videoCode);
          break;
      }
    } else {
      this.playerUrl = undefined;
    }
  }

  youtubeParser() {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const val = this.videoCode.match(regExp);
    this.playerUrl = (val && val[7].length === 11) ? val[7] : '';
  }

  createZoomUrl() {
    return encodeURI(`${environment.zoom_call_server_url}?email=${this.userEmail}&meeting_number=${this.videoCode}&name=${this.userName}&signature=${this.zoomSignature}&host_email=${this.zoomHostEmail}&host_signature=${this.zoomHostSignature}&password=${this.zoomPassword}`);
  }

}
