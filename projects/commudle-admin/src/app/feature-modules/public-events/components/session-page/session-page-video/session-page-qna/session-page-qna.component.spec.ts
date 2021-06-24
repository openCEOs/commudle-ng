import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionPageQnaComponent } from './session-page-qna.component';

describe('SessionPageQnaComponent', () => {
  let component: SessionPageQnaComponent;
  let fixture: ComponentFixture<SessionPageQnaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SessionPageQnaComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionPageQnaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
