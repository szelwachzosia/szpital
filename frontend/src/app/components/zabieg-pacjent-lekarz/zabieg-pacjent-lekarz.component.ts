import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-zabieg-pacjent-lekarz',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './zabieg-pacjent-lekarz.component.html',
  styleUrl: './zabieg-pacjent-lekarz.component.css'
})
export class ZabiegPacjentLekarzComponent implements OnInit {
  zabiegiWizyty: any[] = [];
  wizyty: any[] = [];
  zabiegi: any[] = [];
  selectedZW: any = null;
  showEditZW = false;
  editFormZW: any = {};
  showAddZW = false;
  addFormZW: any = {};

  zabiegiLekarze: any[] = [];
  lekarze: any[] = [];
  selectedZL: any = null;
  showEditZL = false;
  editFormZL: any = {};
  showAddZL = false;
  addFormZL: any = {};

  errorMsg = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.http.get<any[]>('http://localhost:5000/api/zabieg_wizyta').subscribe({
      next: data => this.zabiegiWizyty = data,
      error: err => this.errorMsg = err?.error?.error || err?.error?.message || 'Błąd pobierania zabiegu-wizyt.'
    });
    this.http.get<any[]>('http://localhost:5000/api/wizyty').subscribe({
      next: data => this.wizyty = data,
      error: err => this.errorMsg = err?.error?.error || err?.error?.message || 'Błąd pobierania wizyt.'
    });
    this.http.get<any[]>('http://localhost:5000/api/zabieg_wizyta').subscribe({
      next: data => this.zabiegi = data,
      error: err => {}
    });
    this.http.get<any[]>('http://localhost:5000/api/zabieg_lekarz').subscribe({
      next: data => this.zabiegiLekarze = data,
      error: err => {}
    });
    this.http.get<any[]>('http://localhost:5000/api/pracownicy').subscribe({
      next: data => this.lekarze = data.filter(l => l.stanowisko === 'lekarz'),
      error: err => {}
    });
  }

  openAddZW() {
    this.addFormZW = { zabieg_id: '', wizyta_id: '', typ: '', data: '', godzina: '', opis: '', wynik: '' };
    this.showAddZW = true;
  }
  closeAddZW() { this.showAddZW = false; }
  saveAddZW() {
    const payload = {
      zabieg_id: this.addFormZW.zabieg_id,
      wizyta_id: this.addFormZW.wizyta_id,
      typ: this.addFormZW.typ,
      data: this.addFormZW.data,
      godzina: this.addFormZW.godzina,
      opis: this.addFormZW.opis,
      wynik: this.addFormZW.wynik
    };
    this.http.post<any>('http://localhost:5000/api/zabieg_wizyta', payload).subscribe({
      next: () => { this.loadAll(); this.closeAddZW(); },
      error: err => this.errorMsg = err?.error?.error || err?.error?.message || 'Błąd dodawania zabiegu.'
    });
  }
  openEditZW(zw: any) {
    this.selectedZW = zw;
    this.editFormZW = { ...zw };
    this.showEditZW = true;
  }
  closeEditZW() { this.showEditZW = false; this.selectedZW = null; }
  saveEditZW() {
    this.http.put<any>(`http://localhost:5000/api/zabieg_wizyta/${this.editFormZW.zabieg_id}`, this.editFormZW).subscribe({
      next: () => { this.loadAll(); this.closeEditZW(); },
      error: err => this.errorMsg = err?.error?.error || err?.error?.message || 'Błąd edycji zabiegu.'
    });
  }
  confirmDeleteZW(zw: any) {
    if (confirm('Czy na pewno chcesz usunąć ten zabieg?')) {
      this.http.delete<any>(`http://localhost:5000/api/zabieg_wizyta/${zw.zabieg_id}`).subscribe({
        next: () => this.loadAll(),
        error: err => this.errorMsg = err?.error?.error || err?.error?.message || 'Błąd usuwania zabiegu.'
      });
    }
  }
  getZabiegName(id: number) {
    const z = this.zabiegi.find(x => x.zabieg_id === id);
    return z ? `${z.typ} (${z.data})` : id;
  }
  getWizytaDesc(id: number) {
    const w = this.wizyty.find(x => x.wizyta_id === id);
    return w ? `Wizyta #${w.wizyta_id}` : id;
  }

  openAddZL() {
    this.addFormZL = { zabieg_id: '', lekarz_id: '' };
    this.showAddZL = true;
  }
  closeAddZL() { this.showAddZL = false; }
  saveAddZL() {
    this.http.post<any>('http://localhost:5000/api/zabieg_lekarz', this.addFormZL).subscribe({
      next: () => { this.loadAll(); this.closeAddZL(); },
      error: err => this.errorMsg = err?.error?.message || 'Błąd dodawania powiązania.'
    });
  }
  openEditZL(zl: any) {
    this.selectedZL = zl;
    this.editFormZL = { ...zl };
    this.showEditZL = true;
  }
  closeEditZL() { this.showEditZL = false; this.selectedZL = null; }
  saveEditZL() {
    this.http.put<any>(`http://localhost:5000/api/zabieg_lekarz/${this.editFormZL.zabieg_id}/${this.editFormZL.lekarz_id}`, this.editFormZL).subscribe({
      next: () => { this.loadAll(); this.closeEditZL(); },
      error: err => this.errorMsg = err?.error?.message || 'Błąd edycji powiązania.'
    });
  }
  confirmDeleteZL(zl: any) {
    if (confirm('Czy na pewno chcesz usunąć to powiązanie?')) {
      this.http.delete<any>(`http://localhost:5000/api/zabieg_lekarz/${zl.zabieg_id}/${zl.lekarz_id}`).subscribe({
        next: () => this.loadAll(),
        error: err => this.errorMsg = err?.error?.message || 'Błąd usuwania powiązania.'
      });
    }
  }
  getLekarzName(id: number) {
    const l = this.lekarze.find(x => x.pracownik_id === id);
    return l ? `${l.imie} ${l.nazwisko}` : id;
  }

  saveAdd() {
    if (!this.addFormZL.zabieg_id || !this.addFormZL.lekarz_id) {
      this.errorMsg = 'Wszystkie pola są wymagane.';
      return;
    }
    const payload = {
      zabieg_id: Number(this.addFormZL.zabieg_id),
      lekarz_id: Number(this.addFormZL.lekarz_id)
    };
    this.http.post('http://localhost:5000/api/zabieg_lekarz', payload).subscribe({
      next: () => { this.closeAddZL(); this.loadAll(); },
      error: err => {
        this.errorMsg = err?.error?.message || 'Błąd dodawania zabiegu-lekarz.';
      }
    });
  }
}
