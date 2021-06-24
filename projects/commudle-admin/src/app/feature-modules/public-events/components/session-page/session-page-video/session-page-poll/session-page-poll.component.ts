import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-session-page-poll',
  templateUrl: './session-page-poll.component.html',
  styleUrls: ['./session-page-poll.component.scss']
})
export class SessionPagePollComponent implements OnInit {

  @Input() pollableId: number;
  @Input() pollableType: string;

  constructor() {
  }

  ngOnInit(): void {
  }

}
