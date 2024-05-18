import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociationCreatePopupComponent } from './association-create-popup.component';

describe('AssociationCreatePopupComponent', () => {
  let component: AssociationCreatePopupComponent;
  let fixture: ComponentFixture<AssociationCreatePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssociationCreatePopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssociationCreatePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
