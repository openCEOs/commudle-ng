import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SessionPageDetailsComponent} from './session-page-details.component';

describe('SessionPageDetailsComponent', () => {
  let component: SessionPageDetailsComponent;
  let fixture: ComponentFixture<SessionPageDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SessionPageDetailsComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionPageDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
