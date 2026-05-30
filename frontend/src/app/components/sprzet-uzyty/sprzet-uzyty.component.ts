import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sprzet-uzyty',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sprzet-uzyty.component.html',
  styleUrl: './sprzet-uzyty.component.css'
})
export class SprzetUzytyComponent implements OnInit {
  sprzetUzyty: any[] = [];
  sprzety: any[] = [];
  wizyty: any[] = [];
  addForm = { sprzet_id: '', wizyta_id: '', ilosc: '' };
  editForm = { sprzet_id: '', wizyta_id: '', ilosc: '' };
  showAddModal = false;
  showEditModal = false;
  selectedSU: any = null;
  errorMsg = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadSprzetUzyty();
    this.http.get<any[]>('http://localhost:5000/api/sprzet_szpitala').subscribe(data => this.sprzety = data);
    this.http.get<any[]>('http://localhost:5000/api/wizyty').subscribe(data => this.wizyty = data);
  }

  loadSprzetUzyty() {
    this.http.get<any[]>('http://localhost:5000/api/test_sprzet_wizyta').subscribe({
      next: data => this.sprzetUzyty = data,
      error: err => this.errorMsg = 'Błąd pobierania sprzętu użytego.'
    });
  }

  getSprzetName(id: any) {
    const s = this.sprzety.find(x => x.sprzet_id === id);
    return s ? s.nazwa : id;
  }
  getWizytaName(id: any) {
    const w = this.wizyty.find(x => x.wizyta_id === id);
    return w ? `${w.wizyta_id} (${w.data})` : id;
  }

  openAddModal() {
    this.addForm = { sprzet_id: '', wizyta_id: '', ilosc: '' };
    this.errorMsg = '';
    this.showAddModal = true;
  }
  closeAddModal() { this.showAddModal = false; }
  saveAdd() {
    if (!this.addForm.sprzet_id || !this.addForm.wizyta_id || !this.addForm.ilosc) {
      this.errorMsg = 'Wszystkie pola są wymagane.';
      return;
    }
    const payload = {
      sprzet_id: Number(this.addForm.sprzet_id),
      wizyta_id: Number(this.addForm.wizyta_id),
      ilosc: Number(this.addForm.ilosc)
    };
    this.http.post('http://localhost:5000/api/sprzet_uzyty', payload).subscribe({
      next: () => { this.closeAddModal(); this.loadSprzetUzyty(); },
      error: err => {
        this.errorMsg = err?.error?.message || 'Błąd dodawania sprzętu.';
      }
    });
  }

  openEditModal(su: any) {
    this.selectedSU = su;
    this.editForm = { ...su };
    this.errorMsg = '';
    this.showEditModal = true;
  }
  closeEditModal() { this.showEditModal = false; }
  saveEdit() {
    if (!this.editForm.sprzet_id || !this.editForm.wizyta_id || !this.editForm.ilosc) {
      this.errorMsg = 'Wszystkie pola są wymagane.';
      return;
    }
    const key = `${this.editForm.sprzet_id}/${this.editForm.wizyta_id}`;
    this.http.put(`http://localhost:5000/api/test_sprzet_wizyta/${key}`, this.editForm).subscribe({
      next: () => { this.closeEditModal(); this.loadSprzetUzyty(); },
      error: err => this.errorMsg = 'Błąd edycji.'
    });
  }

  confirmDelete(su: any) {
    if (!su.sprzet_id || !su.wizyta_id) return;
    if (confirm('Czy na pewno chcesz usunąć to użycie sprzętu?')) {
      const key = `${su.sprzet_id}/${su.wizyta_id}`;
      this.http.delete(`http://localhost:5000/api/test_sprzet_wizyta/${key}`).subscribe({
        next: () => this.loadSprzetUzyty(),
        error: err => this.errorMsg = err?.error?.message || 'Błąd usuwania użycia sprzętu.'
      });
    }
  }
}
