import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitePage } from './invite-page';

describe('InvitePage', () => {
  let component: InvitePage;
  let fixture: ComponentFixture<InvitePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvitePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
