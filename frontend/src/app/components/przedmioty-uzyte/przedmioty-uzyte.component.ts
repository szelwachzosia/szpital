import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-przedmioty-uzyte',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './przedmioty-uzyte.component.html',
  styleUrl: './przedmioty-uzyte.component.css'
})
export class PrzedmiotyUzyteComponent implements OnInit {
  przedmiotyUzyte: any[] = [];
  przedmioty: any[] = [];
  wizyty: any[] = [];
  addForm = { przedmiot_id: '', wizyta_id: '', data_uzycia: '', godz_uzycia: '', ilosc_zuzyta: '' };
  editForm = { przedmiot_id: '', wizyta_id: '', data_uzycia: '', godz_uzycia: '', ilosc_zuzyta: '' };
  showAddModal = false;
  showEditModal = false;
  selectedPU: any = null;
  errorMsg = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPrzedmiotyUzyte();
    this.http.get<any[]>('http://localhost:5000/api/przedmioty').subscribe(data => this.przedmioty = data);
    this.http.get<any[]>('http://localhost:5000/api/wizyty').subscribe(data => this.wizyty = data);
  }

  loadPrzedmiotyUzyte() {
    this.http.get<any[]>('http://localhost:5000/api/przedmioty_wizyta').subscribe({
      next: data => this.przedmiotyUzyte = data,
      error: err => this.errorMsg = err?.error?.error || err?.error?.message || 'Błąd pobierania użytych przedmiotów.'
    });
  }

  getPrzedmiotName(id: any) {
    const p = this.przedmioty.find(x => x.przedmiot_id === id);
    return p ? p.nazwa : id;
  }
  getWizytaName(id: any) {
    const w = this.wizyty.find(x => x.wizyta_id === id);
    return w ? `Wizyta #${w.wizyta_id}` : id;
  }

  openAddModal() {
    this.addForm = { przedmiot_id: '', wizyta_id: '', data_uzycia: '', godz_uzycia: '', ilosc_zuzyta: '' };
    this.errorMsg = '';
    this.showAddModal = true;
  }
  closeAddModal() { this.showAddModal = false; }
  saveAdd() {
    this.http.post<any>('http://localhost:5000/api/przedmioty_wizyta', this.addForm).subscribe({
      next: () => { this.loadPrzedmiotyUzyte(); this.closeAddModal(); },
      error: err => this.errorMsg = err?.error?.error || err?.error?.message || 'Błąd dodawania użycia przedmiotu.'
    });
  }

  openEditModal(pu: any) {
    this.selectedPU = pu;
    this.editForm = { ...pu };
    this.errorMsg = '';
    this.showEditModal = true;
  }
  closeEditModal() { this.showEditModal = false; }
  saveEdit() {
    this.http.put<any>(`http://localhost:5000/api/przedmioty_wizyta/${this.editForm.przedmiot_id}/${this.editForm.wizyta_id}`, this.editForm).subscribe({
      next: () => { this.loadPrzedmiotyUzyte(); this.closeEditModal(); },
      error: err => this.errorMsg = err?.error?.error || err?.error?.message || 'Błąd edycji użycia przedmiotu.'
    });
  }

  confirmDelete(pu: any) {
    if (!pu.przedmiot_id || !pu.wizyta_id) return;
    if (confirm('Czy na pewno chcesz usunąć to użycie przedmiotu?')) {
      const key = `${pu.przedmiot_id}/${pu.wizyta_id}`;
      this.http.delete(`http://localhost:5000/api/przedmioty_wizyta/${key}`).subscribe({
        next: () => this.loadPrzedmiotyUzyte(),
        error: err => this.errorMsg = err?.error?.error || err?.error?.message || 'Błąd usuwania użycia przedmiotu.'
      });
    }
  }
}
