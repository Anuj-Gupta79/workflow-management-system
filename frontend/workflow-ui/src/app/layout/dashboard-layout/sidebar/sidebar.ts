import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class Sidebar {
  @Output() linkClicked = new EventEmitter<void>();

  onLinkClick() {
    if (window.innerWidth <= 768) {
      this.linkClicked.emit();
    }
  }
}
