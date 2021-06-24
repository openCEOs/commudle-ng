import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SessionPageVideoComponent} from './session-page-video.component';

describe('SessionPageVideoComponent', () => {
  let component: SessionPageVideoComponent;
  let fixture: ComponentFixture<SessionPageVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SessionPageVideoComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionPageVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
