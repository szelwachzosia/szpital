import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-wizyty',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './wizyty.component.html',
  styleUrls: ['./wizyty.component.css']
})
export class WizytyComponent implements OnInit {
  wizyty: any[] = [];
  pacjenci: any[] = [];
  pracownicy: any[] = [];
  lozka: any[] = [];
  errorMsg = '';
  showAddModal = false;
  showEditModal = false;
  selectedWizyta: any = null;
  addForm = { pacjent_id: '', pracownik_id: '', lozko_id: '', data_przyjecia: '', data_wypisu: '', data_wizyty: '', rodzaj_wizyty: '', komentarz: '' };
  editForm = { wizyta_id: '', pacjent_id: '', pracownik_id: '', lozko_id: '', data_przyjecia: '', data_wypisu: '', data_wizyty: '', rodzaj_wizyty: '', komentarz: '' };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadWizyty();
    this.http.get<any[]>('http://localhost:5000/api/pacjent').subscribe(data => this.pacjenci = data);
    this.http.get<any[]>('http://localhost:5000/api/pracownicy').subscribe(data => this.pracownicy = data);
    this.http.get<any[]>('http://localhost:5000/api/lozko').subscribe(data => this.lozka = data);
  }

  loadWizyty() {
    this.http.get<any[]>('http://localhost:5000/api/wizyty').subscribe({
      next: data => this.wizyty = data,
      error: err => this.errorMsg = 'Błąd pobierania wizyt.'
    });
  }

  openAddModal() {
    this.addForm = { pacjent_id: '', pracownik_id: '', lozko_id: '', data_przyjecia: '', data_wypisu: '', data_wizyty: '', rodzaj_wizyty: '', komentarz: '' };
    this.errorMsg = '';
    this.showAddModal = true;
  }
  closeAddModal() { this.showAddModal = false; }

  saveAdd() {
    // Walidacja: wymagane pola
    if (!this.addForm.pacjent_id || !this.addForm.pracownik_id || !this.addForm.data_przyjecia || !this.addForm.data_wizyty || !this.addForm.rodzaj_wizyty) {
      this.errorMsg = 'Wszystkie wymagane pola muszą być wypełnione.';
      return;
    }
    const payload = {
      pacjent_id: Number(this.addForm.pacjent_id),
      pracownik_id: Number(this.addForm.pracownik_id),
      lozko_id: this.addForm.lozko_id ? Number(this.addForm.lozko_id) : null,
      data_przyjecia: this.addForm.data_przyjecia,
      data_wypisu: this.addForm.data_wypisu || null,
      data_wizyty: this.addForm.data_wizyty,
      rodzaj_wizyty: this.addForm.rodzaj_wizyty,
      komentarz: this.addForm.komentarz || ''
    };
    this.http.post('http://localhost:5000/api/wizyty', payload).subscribe({
      next: () => { this.closeAddModal(); this.loadWizyty(); },
      error: err => {
        this.errorMsg = err?.error?.message || 'Błąd dodawania wizyty.';
      }
    });
  }

  openEditModal(wizyta: any) {
    this.selectedWizyta = wizyta;
    this.editForm = { ...wizyta };
    this.errorMsg = '';
    this.showEditModal = true;
  }
  closeEditModal() { this.showEditModal = false; }

  saveEdit() {
    this.http.put<any>(`http://localhost:5000/api/wizyty/${this.editForm.wizyta_id}`, this.editForm).subscribe({
      next: () => { this.loadWizyty(); this.closeEditModal(); },
      error: err => this.errorMsg = 'Błąd edycji wizyty.'
    });
  }

  confirmDelete(wizyta: any) {
    if (confirm('Czy na pewno chcesz usunąć tę wizytę?')) {
      this.http.delete<any>(`http://localhost:5000/api/wizyty/${wizyta.wizyta_id}`).subscribe({
        next: () => this.loadWizyty(),
        error: err => this.errorMsg = 'Błąd usuwania wizyty.'
      });
    }
  }

  getPacjentName(id: number) {
    const p = this.pacjenci.find(x => x.pacjent_id === id);
    return p ? `${p.imie} ${p.nazwisko}` : id;
  }
  getPracownikName(id: number) {
    const p = this.pracownicy.find(x => x.pracownik_id === id);
    return p ? `${p.imie} ${p.nazwisko}` : id;
  }
  getLozkoName(id: number) {
    const l = this.lozka.find(x => x.lozko_id === id);
    return l ? l.lozko_id : id;
  }
}
