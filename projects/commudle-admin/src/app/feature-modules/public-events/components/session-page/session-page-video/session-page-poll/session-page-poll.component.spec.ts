import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionPagePollComponent } from './session-page-poll.component';

describe('SessionPagePollComponent', () => {
  let component: SessionPagePollComponent;
  let fixture: ComponentFixture<SessionPagePollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SessionPagePollComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionPagePollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
