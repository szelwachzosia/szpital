import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pracownik-oddzial',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './pracownik-oddzial.component.html',
  styleUrls: ['./pracownik-oddzial.component.css']
})
export class PracownikOddzialComponent implements OnInit {
  pracownikOddzial: any[] = [];
  pracownicy: any[] = [];
  oddzialy: any[] = [];
  selectedPO: any = null;
  showEditModal = false;
  editForm = {
    pracownik_id: '',
    oddzial_id: '',
    tydzien_start: '',
    ilosc_godzin: ''
  };
  showAddModal = false;
  addForm = {
    pracownik_id: '',
    oddzial_id: '',
    tydzien_start: '',
    ilosc_godzin: ''
  };
  filterPracownikId = '';
  filterOddzialId = '';
  errorMsg = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPracownikOddzial();
    this.http.get<any[]>('http://localhost:5000/api/pracownicy').subscribe(data => this.pracownicy = data);
    this.http.get<any[]>('http://localhost:5000/api/oddzial').subscribe(data => this.oddzialy = data);
  }

  loadPracownikOddzial() {
    let url = 'http://localhost:5000/api/pracownicy_oddzial';
    const params: string[] = [];
    if (this.filterPracownikId) params.push(`pracownik_id=${this.filterPracownikId}`);
    if (this.filterOddzialId) params.push(`oddzial_id=${this.filterOddzialId}`);
    if (params.length) url += '?' + params.join('&');
    this.http.get<any[]>(url).subscribe({
      next: data => this.pracownikOddzial = data,
      error: err => this.errorMsg = 'Błąd pobierania powiązań pracownik-oddział.'
    });
  }

  getPracownikName(id: any) {
    const p = this.pracownicy.find(x => x.pracownik_id === id);
    return p ? `${p.imie} ${p.nazwisko}` : id;
  }
  getOddzialName(id: any) {
    const o = this.oddzialy.find(x => x.oddzial_id === id);
    return o ? o.nazwa : id;
  }

  openAddModal() {
    this.addForm = { pracownik_id: '', oddzial_id: '', tydzien_start: '', ilosc_godzin: '' };
    this.errorMsg = '';
    this.showAddModal = true;
  }
  closeAddModal() { this.showAddModal = false; }
  saveAdd() {
    if (!this.addForm.pracownik_id || !this.addForm.oddzial_id || !this.addForm.tydzien_start) {
      this.errorMsg = 'Wszystkie pola są wymagane.';
      return;
    }
    const payload = {
      pracownik_id: Number(this.addForm.pracownik_id),
      oddzial_id: Number(this.addForm.oddzial_id),
      tydzien_start: this.addForm.tydzien_start,
      ilosc_godzin: this.addForm.ilosc_godzin ? Number(this.addForm.ilosc_godzin) : null
    };
    this.http.post('http://localhost:5000/api/pracownicy_oddzial', payload).subscribe({
      next: () => { this.closeAddModal(); this.loadPracownikOddzial(); },
      error: err => {
        this.errorMsg = err?.error?.message || 'Błąd dodawania powiązania.';
      }
    });
  }

  openEditModal(po: any) {
    this.selectedPO = po;
    this.editForm = { ...po };
    this.errorMsg = '';
    this.showEditModal = true;
  }
  closeEditModal() { this.showEditModal = false; }
  saveEdit() {
    if (!this.editForm.pracownik_id || !this.editForm.oddzial_id || !this.editForm.tydzien_start) {
      this.errorMsg = 'Wszystkie pola są wymagane.';
      return;
    }
    const key = `${this.editForm.pracownik_id}/${this.editForm.oddzial_id}/${this.editForm.tydzien_start}`;
    this.http.put(`http://localhost:5000/api/pracownicy_oddzial/${key}`, this.editForm).subscribe({
      next: () => { this.closeEditModal(); this.loadPracownikOddzial(); },
      error: err => this.errorMsg = 'Błąd edycji powiązania.'
    });
  }

  confirmDelete(po: any) {
    if (!po.pracownik_id || !po.oddzial_id || !po.tydzien_start) return;
    if (confirm('Czy na pewno chcesz usunąć to powiązanie?')) {
      const key = `${po.pracownik_id}/${po.oddzial_id}/${po.tydzien_start}`;
      this.http.delete(`http://localhost:5000/api/pracownicy_oddzial/${key}`).subscribe({
        next: () => this.loadPracownikOddzial(),
        error: err => this.errorMsg = err?.error?.message || 'Błąd usuwania powiązania.'
      });
    }
  }
}
