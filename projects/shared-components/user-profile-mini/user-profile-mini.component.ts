import { Component, Input, OnInit } from '@angular/core';
import { IUser } from 'projects/shared-models/user.model';

@Component({
  selector: 'app-user-profile-mini',
  templateUrl: './user-profile-mini.component.html',
  styleUrls: ['./user-profile-mini.component.scss']
})
export class UserProfileMiniComponent implements OnInit {

  @Input() user: IUser;
  @Input() size: string;
  @Input() designation: boolean;
  @Input() showLiveStatus: boolean;

  constructor() {
  }

  ngOnInit() {
  }

}
