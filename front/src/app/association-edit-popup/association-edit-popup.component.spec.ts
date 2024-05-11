import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociationEditPopupComponent } from './association-edit-popup.component';

describe('AssociationEditPopupComponent', () => {
  let component: AssociationEditPopupComponent;
  let fixture: ComponentFixture<AssociationEditPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssociationEditPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssociationEditPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
