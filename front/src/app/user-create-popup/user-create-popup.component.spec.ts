import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCreatePopupComponent } from './user-create-popup.component';

describe('UserCreatePopupComponent', () => {
  let component: UserCreatePopupComponent;
  let fixture: ComponentFixture<UserCreatePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserCreatePopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserCreatePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
