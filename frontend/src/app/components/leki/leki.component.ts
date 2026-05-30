import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-leki',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './leki.component.html',
  styleUrl: './leki.component.css'
})
export class LekiComponent implements OnInit {
  leki: any[] = [];
  selectedLek: any = null;
  showEditModal = false;
  showAddModal = false;
  editForm: any = { nazwa: '', typ: '', producent: '', data_przeterminowania: '' };
  addForm: any = { nazwa: '', typ: '', producent: '', data_przeterminowania: '' };
  apiUrl = 'http://localhost:5000/api/leki';
  errorMsg = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadLeki();
  }

  loadLeki() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: data => this.leki = data,
      error: err => this.errorMsg = 'Błąd pobierania leków.'
    });
  }

  openAddModal() {
    this.addForm = { nazwa: '', typ: '', producent: '', data_przeterminowania: '' };
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  saveAdd() {
    this.http.post(this.apiUrl, this.addForm).subscribe({
      next: () => {
        this.loadLeki();
        this.closeAddModal();
      },
      error: err => this.errorMsg = 'Błąd dodawania leku.'
    });
  }

  openEditModal(lek: any) {
    this.selectedLek = lek;
    this.editForm = { ...lek };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedLek = null;
  }

  saveEdit() {
    if (!this.selectedLek) return;
    this.http.put(`${this.apiUrl}/${this.selectedLek.lek_id}`, this.editForm).subscribe({
      next: () => {
        this.loadLeki();
        this.closeEditModal();
      },
      error: err => this.errorMsg = 'Błąd edycji leku.'
    });
  }

  deleteLek(lek: any) {
    if (!confirm('Czy na pewno chcesz usunąć ten lek?')) return;
    this.http.delete(`${this.apiUrl}/${lek.lek_id}`).subscribe({
      next: () => this.loadLeki(),
      error: err => this.errorMsg = 'Błąd usuwania leku.'
    });
  }
}
