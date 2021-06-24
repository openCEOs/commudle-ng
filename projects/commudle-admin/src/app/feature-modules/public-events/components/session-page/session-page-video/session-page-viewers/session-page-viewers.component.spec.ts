import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionPageViewersComponent } from './session-page-viewers.component';

describe('SessionPageViewersComponent', () => {
  let component: SessionPageViewersComponent;
  let fixture: ComponentFixture<SessionPageViewersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SessionPageViewersComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionPageViewersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
