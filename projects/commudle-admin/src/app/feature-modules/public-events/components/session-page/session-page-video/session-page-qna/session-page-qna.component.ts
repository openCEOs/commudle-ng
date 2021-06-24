import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IDiscussion } from 'projects/shared-models/discussion.model';

@Component({
  selector: 'app-session-page-qna',
  templateUrl: './session-page-qna.component.html',
  styleUrls: ['./session-page-qna.component.scss']
})
export class SessionPageQnaComponent implements OnInit {

  @Input() qna: IDiscussion;
  @Output() newQna: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit(): void {
  }

  newQnaNotification(): void {
    this.newQna.emit();
  }

}
