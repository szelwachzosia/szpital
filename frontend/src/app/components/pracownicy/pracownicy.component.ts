import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pracownicy',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './pracownicy.component.html',
  styleUrls: ['./pracownicy.component.css']
})
export class PracownicyComponent implements OnInit {
  pracownicy: any[] = [];
  stanowiska: string[] = ['lekarz', 'pielegniarka', 'ordynator', 'technik'];
  specjalizacje: string[] = ["Chirurgia",'Dermatologia','Geriatria', 'Hematologia', 'Immunologia', 'Internista','Kardiolog','Okulista', 'Onkolog' ,'Ortopedia', 'Pediatria', 'Pneumologia', 'Połonictwo', 'Psychiatria', 'Rehabilitacja', 'Zewnętrzny'];
  selectedPracownik: any = null;
  showEditModal = false;
  editForm: any = {};
  showAddModal = false;
  addForm: any = {};
  errorMsg = '';
  apiUrl = 'http://localhost:5001/api/pracownicy';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPracownicy();
  }

  loadPracownicy() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: data => this.pracownicy = data,
      error: err => this.errorMsg = 'Błąd pobierania pracowników.'
    });
  }

  openEditModal(pracownik: any) {
    this.selectedPracownik = pracownik;
    this.editForm = { ...pracownik };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedPracownik = null;
  }

  saveEdit() {
    if (!this.selectedPracownik) return;
    this.http.put(`${this.apiUrl}/${this.selectedPracownik.pracownik_id}`, this.editForm)
      .subscribe({
        next: () => {
          this.closeEditModal();
          this.loadPracownicy();
        },
        error: err => this.errorMsg = 'Błąd edycji pracownika.'
      });
  }

  openAddModal() {
    this.addForm = {
      imie: '',
      nazwisko: '',
      stanowisko: '',
      specjalizacja: '',
      adres: '',
      numer_telefonu: '',
      rodzaj_pensji: '',
      pensja: ''
    };
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  saveAdd() {
    this.http.post(this.apiUrl, this.addForm)
      .subscribe({
        next: () => {
          this.closeAddModal();
          this.loadPracownicy();
        },
        error: err => this.errorMsg = 'Błąd dodawania pracownika.'
      });
  }

  confirmDelete(pracownik: any) {
    if (confirm('Czy na pewno chcesz usunąć pracownika?')) {
      this.http.delete(`${this.apiUrl}/${pracownik.pracownik_id}`)
        .subscribe({
          next: () => this.loadPracownicy(),
          error: err => this.errorMsg = 'Błąd usuwania pracownika.'
        });
    }
  }

  onAddStanowiskoChange() {
    if (this.addForm.stanowisko !== 'lekarz' && this.addForm.stanowisko !== 'ordynator') {
      this.addForm.specjalizacja = 'brak';
    }
  }

  onEditStanowiskoChange() {
    if (this.editForm.stanowisko !== 'lekarz' && this.editForm.stanowisko !== 'ordynator') {
      this.editForm.specjalizacja = 'brak';
    }
  }
}