import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-wszystkie-testy',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './wszystkie-testy.component.html',
  styleUrls: ['./wszystkie-testy.component.css']
})
export class WszystkieTestyComponent implements OnInit {
  testy: any[] = [];
  selectedTest: any = null;
  showEditModal = false;
  editForm: { test_id?: number, nazwa: string } = { nazwa: '' };
  showAddModal = false;
  addForm: { test_id?: number, nazwa: string } = { nazwa: '' };
  errorMsg = '';
  apiUrl = 'http://localhost:5000/api/wszystkie_testy'; // zmieniony endpoint

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadTesty();
  }

  loadTesty() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: data => this.testy = data,
      error: err => this.errorMsg = 'Błąd pobierania testów.'
    });
  }

  openEditModal(test: any) {
    this.selectedTest = test;
    this.editForm = { test_id: test.test_id, nazwa: test.nazwa };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedTest = null;
  }

  saveEdit() {
    this.http.put<any>(`http://localhost:5000/api/wszystkie_testy/${this.editForm.test_id}`, this.editForm).subscribe({
      next: () => { this.loadTesty(); this.closeEditModal(); },
      error: err => this.errorMsg = err?.error?.message || 'Błąd edycji testu.'
    });
  }

  openAddModal() {
    this.addForm = { nazwa: '' };
    this.errorMsg = '';
    this.showAddModal = true;
  }
  closeAddModal() { this.showAddModal = false; }
  saveAdd() {
    this.http.post<any>('http://localhost:5000/api/testy', this.addForm).subscribe({
      next: () => { this.loadTesty(); this.closeAddModal(); },
      error: err => this.errorMsg = err?.error?.message || 'Błąd dodawania testu.'
    });
  }

  confirmDelete(test: any) {
    if (confirm('Czy na pewno chcesz usunąć ten test?')) {
      this.http.delete<any>(`http://localhost:5000/api/wszystkie_testy/${test.test_id}`).subscribe({
        next: () => this.loadTesty(),
        error: err => this.errorMsg = err?.error?.message || 'Błąd usuwania testu.'
      });
    }
  }
}
