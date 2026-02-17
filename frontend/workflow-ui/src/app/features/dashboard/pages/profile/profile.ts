import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProfileService, Profile } from '../../services/profile.service';
import { Observable, Subject, of } from 'rxjs';
import { switchMap, startWith, catchError, shareReplay, map } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent {
  private reload$ = new Subject<void>();

  profile$: Observable<Profile>;
  loading$: Observable<boolean>;

  saving = false;

  profileForm!: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
  ) {
    // ✅ Initialize form HERE
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
    });

    this.profile$ = this.reload$.pipe(
      startWith<void>(undefined),
      switchMap(() => this.profileService.getProfile().pipe(catchError(() => of(null as any)))),
      shareReplay(1),
    );

    this.loading$ = this.profile$.pipe(
      map(() => false),
      startWith(true),
    );

    this.profile$.subscribe((profile) => {
      if (profile) {
        this.profileForm.patchValue({
          name: profile.name,
          email: profile.email,
        });
      }
    });
  }

  reload() {
    this.reload$.next();
  }

  save() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    this.profileService.updateProfile(this.profileForm.value as any).subscribe({
      next: () => {
        this.saving = false;
        this.reload();
      },
      error: () => {
        this.saving = false;
        alert('Failed to update profile');
      },
    });
  }

  get f() {
    return this.profileForm.controls;
  }
}
