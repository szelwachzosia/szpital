import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-test-pacjent',
  templateUrl: './test-pacjent.component.html',
  styleUrls: ['./test-pacjent.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class TestPacjentComponent implements OnInit {
  testPacjent: any[] = [];
  selectedTest: any = null;
  addForm: any = { pacjent_id: '', sprzet_id: '', data: '', godzina: '', wynik: '', wizyta_id: '', test_nazwa: '' };
  editForm: any = { pacjent_id: '', sprzet_id: '', data: '', godzina: '', wynik: '', wizyta_id: '', test_nazwa: '' };
  apiUrl = 'http://localhost:5000/api/test_sprzet_wizyta';
  errorMsg = '';
  pacjenci: any[] = [];
  sprzety: any[] = [];
  wizyty: any[] = [];
  showAddModal = false;
  showEditModal = false;
  showDeleteModal = false;
  showWizytaModal = false;
  wizytaDetails: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadTestPacjent();
    this.http.get<any[]>('http://localhost:5000/api/pacjent').subscribe(data => this.pacjenci = data);
    this.http.get<any[]>('http://localhost:5000/api/sprzet_szpitala').subscribe(data => this.sprzety = data);
    this.http.get<any[]>('http://localhost:5000/api/wizyty').subscribe(data => this.wizyty = data);
  }

  loadTestPacjent() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: data => this.testPacjent = data,
      error: err => this.errorMsg = 'Błąd pobierania testów pacjentów.'
    });
  }

  openAddModal() {
    this.addForm = { pacjent_id: '', sprzet_id: '', data: '', godzina: '', wynik: '', wizyta_id: '', test_nazwa: '' };
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  saveAdd() {
    this.http.post<any>(this.apiUrl, this.addForm).subscribe({
      next: () => { this.loadTestPacjent(); this.closeAddModal(); },
      error: err => this.errorMsg = err?.error?.message || 'Błąd dodawania testu.'
    });
  }

  openEditModal(test: any) {
    this.selectedTest = test;
    this.editForm = { ...test };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedTest = null;
  }

  saveEdit() {
    const key = `${this.editForm.sprzet_id}/${this.editForm.wizyta_id}`;
    this.http.put<any>(`${this.apiUrl}/${key}`, this.editForm).subscribe({
      next: () => { this.loadTestPacjent(); this.closeEditModal(); },
      error: err => this.errorMsg = err?.error?.message || 'Błąd edycji testu.'
    });
  }

  openDeleteModal(test: any) {
    this.selectedTest = test;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedTest = null;
  }

  deleteTestPacjent() {
    if (!this.selectedTest) return;
    const key = `${this.selectedTest.sprzet_id}/${this.selectedTest.wizyta_id}`;
    this.http.delete<any>(`${this.apiUrl}/${key}`).subscribe({
      next: () => { this.loadTestPacjent(); this.closeDeleteModal(); },
      error: err => this.errorMsg = err?.error?.message || 'Błąd usuwania testu.'
    });
  }

  confirmDelete(test: any) {
    if (confirm('Czy na pewno chcesz usunąć ten test pacjent?')) {
      const key = `${test.sprzet_id}/${test.wizyta_id}`;
      this.http.delete<any>(`${this.apiUrl}/${key}`).subscribe({
        next: () => this.loadTestPacjent(),
        error: err => this.errorMsg = err?.error?.message || 'Błąd usuwania testu.'
      });
    }
  }

  getPacjentName(id: number) {
    const p = this.pacjenci.find(x => x.pacjent_id === id);
    return p ? `${p.imie} ${p.nazwisko}` : id;
  }

  getSprzetName(id: number) {
    const s = this.sprzety.find(x => x.sprzet_id === id);
    return s ? s.nazwa : id;
  }

  openWizytaModal(wizyta_id: number) {
    this.http.get<any>(`http://localhost:5000/api/wizyty`).subscribe({
      next: wizyty => {
        const wizyta = Array.isArray(wizyty) ? wizyty.find((w: any) => w.wizyta_id === wizyta_id) : null;
        this.wizytaDetails = wizyta;
        this.showWizytaModal = true;
      },
      error: err => this.errorMsg = 'Błąd pobierania szczegółów wizyty.'
    });
  }

  closeWizytaModal() {
    this.showWizytaModal = false;
    this.wizytaDetails = null;
  }
}
