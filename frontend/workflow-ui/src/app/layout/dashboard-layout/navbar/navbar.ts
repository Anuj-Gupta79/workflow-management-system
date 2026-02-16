import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  standalone: true,
})
export class Navbar {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() toggleMobile = new EventEmitter<void>();

  onToggle() {
    if (window.innerWidth <= 768) {
      this.toggleMobile.emit();
    } else {
      this.toggleSidebar.emit();
    }
  }
}
