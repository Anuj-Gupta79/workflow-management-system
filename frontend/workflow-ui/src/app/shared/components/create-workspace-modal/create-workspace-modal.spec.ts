import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateWorkspaceModal } from './create-workspace-modal';

describe('CreateWorkspaceModal', () => {
  let component: CreateWorkspaceModal;
  let fixture: ComponentFixture<CreateWorkspaceModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateWorkspaceModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateWorkspaceModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
