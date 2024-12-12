import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageViewsComponent } from './manage-views.component';

describe('ManageViewsComponent', () => {
  let component: ManageViewsComponent;
  let fixture: ComponentFixture<ManageViewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageViewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageViewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
