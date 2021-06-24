import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QnaListItemComponent } from './qna-list-item.component';

describe('QnaListItemComponent', () => {
  let component: QnaListItemComponent;
  let fixture: ComponentFixture<QnaListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QnaListItemComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QnaListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
