import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  navLinks = [
    { path: '/pracownicy', label: 'Pracownicy', icon: 'bi-people' },
    { path: '/wizyty', label: 'Wizyty', icon: 'bi-calendar-check' },
    { path: '/pacjent', label: 'Pacjenci', icon: 'bi-person-badge' },
    { path: '/oddzial', label: 'Oddziały', icon: 'bi-building' },
    { path: '/zmiany', label: 'Zmiany', icon: 'bi-clock-history' },
    { path: '/test-pacjent', label: 'Testy Sprzętu', icon: 'bi-activity' },
    { path: '/lozko', label: 'Łóżka', icon: 'bi-hospital' },
    { path: '/przedmioty', label: 'Przedmioty', icon: 'bi-box-seam' },
    { path: '/przedmioty-uzyte', label: 'Przedmioty użyte', icon: 'bi-boxes' },
    { path: '/sprzety', label: 'Sprzęt', icon: 'bi-cpu' },
    { path: '/leki', label: 'Leki', icon: 'bi-capsule' },
    { path: '/leki-pacjent', label: 'Leki Pacjent', icon: 'bi-capsule-pill' },
    { path: '/zabieg-pacjent-lekarz', label: 'Zabiegi', icon: 'bi-heart-pulse' }
  ];
}
