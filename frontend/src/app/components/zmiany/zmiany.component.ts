import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-zmiany',
  templateUrl: './zmiany.component.html',
  styleUrl: './zmiany.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class ZmianyComponent implements OnInit {
  apiUrl = 'http://localhost:5001/api/pracownicy_oddzial';
  zmiany: any[] = [];
  selectedZmiana: any = null;
  newZmiana: any = { pracownik_id: '', oddzial_id: '', tydzien_start: '', ilosc_godzin: '' };
  showAddModal = false;
  showEditModal = false;
  showDeleteModal = false;
  pracownicy: any[] = [];
  oddzialy: any[] = [];
  errorMsg = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getZmiany();
    this.http.get<any[]>('http://localhost:5001/api/pracownicy').subscribe(data => this.pracownicy = data);
    this.http.get<any[]>('http://localhost:5001/api/oddzial').subscribe(data => this.oddzialy = data);
  }

  getZmiany() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: data => this.zmiany = data,
      error: err => this.errorMsg = 'Błąd pobierania zmian.'
    });
  }

  openAddModal() {
    this.newZmiana = { pracownik_id: '', oddzial_id: '', tydzien_start: '', ilosc_godzin: '' };
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  addZmiana() {
    this.http.post<any>(this.apiUrl, this.newZmiana).subscribe({
      next: () => { this.getZmiany(); this.closeAddModal(); },
      error: err => this.errorMsg = 'Błąd dodawania zmiany.'
    });
  }

  openEditModal(zmiana: any) {
    this.selectedZmiana = zmiana;
    this.newZmiana = { ...zmiana };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  updateZmiana() {
    this.http.put<any>(`${this.apiUrl}/${this.selectedZmiana.pracownik_id}/${this.selectedZmiana.oddzial_id}/${this.selectedZmiana.tydzien_start}`, this.newZmiana).subscribe({
      next: () => { this.getZmiany(); this.closeEditModal(); },
      error: err => this.errorMsg = 'Błąd edycji zmiany.'
    });
  }

  openDeleteModal(zmiana: any) {
    this.selectedZmiana = zmiana;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  deleteZmiana() {
    if (!this.selectedZmiana) return;
    this.http.delete<any>(`${this.apiUrl}/${this.selectedZmiana.pracownik_id}/${this.selectedZmiana.oddzial_id}/${this.selectedZmiana.tydzien_start}`).subscribe({
      next: () => { this.getZmiany(); this.closeDeleteModal(); },
      error: err => this.errorMsg = 'Błąd usuwania zmiany.'
    });
  }

  confirmDelete(zmiana: any) {
    this.selectedZmiana = zmiana;
    if (confirm('Czy na pewno chcesz usunąć tę zmianę?')) {
      this.deleteZmiana();
    }
  }
}
