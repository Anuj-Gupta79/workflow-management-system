import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgSelect } from './org-select';

describe('OrgSelect', () => {
  let component: OrgSelect;
  let fixture: ComponentFixture<OrgSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgSelect]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgSelect);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
