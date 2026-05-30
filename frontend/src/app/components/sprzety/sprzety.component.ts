import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-sprzety',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './sprzety.component.html',
  styleUrl: './sprzety.component.css'
})
export class SprzetyComponent implements OnInit {
  sprzety: any[] = [];
  errorMsg = '';
  addForm = { nazwa: '', typ: '', producent: '' };
  editForm = { sprzet_id: '', nazwa: '', typ: '', producent: '' };
  showAddModal = false;
  showEditModal = false;
  selectedSprzet: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadSprzety();
  }

  loadSprzety() {
    this.http.get<any[]>('http://localhost:5000/api/sprzet_szpitala').subscribe({
      next: data => this.sprzety = data,
      error: err => this.errorMsg = 'Błąd pobierania sprzętu.'
    });
  }

  openAddModal() {
    this.addForm = { nazwa: '', typ: '', producent: '' };
    this.errorMsg = '';
    this.showAddModal = true;
  }
  closeAddModal() { this.showAddModal = false; }
  saveAdd() {
    this.http.post<any>('http://localhost:5000/api/sprzet_szpitala', this.addForm).subscribe({
      next: () => { this.loadSprzety(); this.closeAddModal(); },
      error: err => this.errorMsg = err?.error?.message || 'Błąd dodawania sprzętu.'
    });
  }

  openEditModal(sprzet: any) {
    this.selectedSprzet = sprzet;
    this.editForm = { ...sprzet };
    this.errorMsg = '';
    this.showEditModal = true;
  }
  closeEditModal() { this.showEditModal = false; }
  saveEdit() {
    this.http.put<any>(`http://localhost:5000/api/sprzet_szpitala/${this.editForm.sprzet_id}`, this.editForm).subscribe({
      next: () => { this.loadSprzety(); this.closeEditModal(); },
      error: err => this.errorMsg = err?.error?.message || 'Błąd edycji sprzętu.'
    });
  }

  confirmDelete(sprzet: any) {
    if (confirm('Czy na pewno chcesz usunąć ten sprzęt?')) {
      this.http.delete<any>(`http://localhost:5000/api/sprzet_szpitala/${sprzet.sprzet_id}`).subscribe({
        next: () => this.loadSprzety(),
        error: err => this.errorMsg = err?.error?.message || 'Błąd usuwania sprzętu.'
      });
    }
  }
}
