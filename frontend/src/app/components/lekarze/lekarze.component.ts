import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lekarze',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './lekarze.component.html',
  styleUrls: ['./lekarze.component.css']
})
export class LekarzeComponent implements OnInit {
  lekarze: any[] = [];
  selectedLekarz: any = null;
  showEditModal = false;
  editForm = {
    pracownik_id: '', specjalizacja: '', ordynator_id: '', oddzial_id: ''
  };
  showAddModal = false;
  addForm = {
    pracownik_id: '', specjalizacja: '', ordynator_id: '', oddzial_id: ''
  };
  pracownicy: any[] = [];
  oddzialy: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadLekarze();
    this.http.get<any[]>('http://localhost:5001/api/pracownicy').subscribe(data => this.pracownicy = data);
    this.http.get<any[]>('http://localhost:5001/api/oddzial').subscribe(data => this.oddzialy = data);
  }

  loadLekarze() {
    // Nowy endpoint: /api/pracownicy?stanowisko=lekarz
    this.http.get<any[]>('http://localhost:5001/api/pracownicy').subscribe(data => {
      this.lekarze = data.filter(p => p.stanowisko === 'lekarz');
    });
  }

  openEditModal(lekarz: any) {
    this.selectedLekarz = lekarz;
    this.editForm = { ...lekarz };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedLekarz = null;
  }

  saveEdit() {
    if (!this.selectedLekarz) return;
    this.http.put(`http://localhost:5001/api/lekarze/${this.selectedLekarz.lekarz_id}`, this.editForm)
      .subscribe(() => {
        this.closeEditModal();
        this.loadLekarze();
      });
  }

  openAddModal() {
    this.addForm = { pracownik_id: '', specjalizacja: '', ordynator_id: '', oddzial_id: '' };
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  saveAdd() {
    this.http.post('http://localhost:5001/api/lekarze', this.addForm)
      .subscribe(() => {
        this.closeAddModal();
        this.loadLekarze();
      });
  }

  confirmDelete(lekarz: any) {
    if (confirm(`Czy na pewno chcesz usunąć lekarza o ID: ${lekarz.lekarz_id}?`)) {
      this.http.delete(`http://localhost:5001/api/lekarze/${lekarz.lekarz_id}`)
        .subscribe(() => this.loadLekarze());
    }
  }

  getPracownikName(id: number) {
    const p = this.pracownicy.find(x => x.pracownik_id === id);
    return p ? `${p.imie} ${p.nazwisko}` : id;
  }
  getOddzialName(id: number) {
    const o = this.oddzialy.find(x => x.oddzial_id === id);
    return o ? o.nazwa : id;
  }
  getOrdynatorName(id: number) {
    const p = this.pracownicy.find(x => x.pracownik_id === id);
    return p ? `${p.imie} ${p.nazwisko}` : id;
  }
}
