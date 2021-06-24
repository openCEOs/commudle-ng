import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionPageChatComponent } from './session-page-chat.component';

describe('SessionPageChatComponent', () => {
  let component: SessionPageChatComponent;
  let fixture: ComponentFixture<SessionPageChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SessionPageChatComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionPageChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
