import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-leki-pacjent',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './leki-pacjent.component.html',
  styleUrls: ['./leki-pacjent.component.css']
})
export class LekiPacjentComponent implements OnInit {
  lekiWizyta: any[] = [];
  leki: any[] = [];
  wizyty: any[] = [];
  selectedLW: any = null;
  showEditModalLW = false;
  editFormLW = { wizyta_id: '', lek_id: '', dawka: '', komentarz: '' };
  showAddModalLW = false;
  addFormLW = { wizyta_id: '', lek_id: '', dawka: '', komentarz: '' };
  errorMsg = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.http.get<any[]>('http://localhost:5001/api/lek_wizyta').subscribe({
      next: data => this.lekiWizyta = data,
      error: err => this.errorMsg = 'Błąd pobierania leków do wizyty.'
    });
    this.http.get<any[]>('http://localhost:5001/api/leki').subscribe({
      next: data => this.leki = data,
      error: err => this.errorMsg = 'Błąd pobierania leków.'
    });
    this.http.get<any[]>('http://localhost:5001/api/wizyty').subscribe({
      next: data => this.wizyty = data,
      error: err => this.errorMsg = 'Błąd pobierania wizyt.'
    });
  }

  openAddModalLW() {
    this.addFormLW = { wizyta_id: '', lek_id: '', dawka: '', komentarz: '' };
    this.showAddModalLW = true;
  }
  closeAddModalLW() {
    this.showAddModalLW = false;
  }
  saveAddLW() {
    const payload = {
      wizyta_id: this.addFormLW.wizyta_id,
      lek_id: this.addFormLW.lek_id,
      dawka: this.addFormLW.dawka,
      komentarz: this.addFormLW.komentarz
    };
    this.http.post('http://localhost:5001/api/lek_wizyta', payload).subscribe({
      next: () => { this.loadAll(); this.closeAddModalLW(); },
      error: () => this.errorMsg = 'Błąd dodawania leku do wizyty.'
    });
  }
  openEditModalLW(lw: any) {
    this.selectedLW = lw;
    this.editFormLW = {
      wizyta_id: lw.wizyta_id,
      lek_id: lw.lek_id,
      dawka: lw.dawka,
      komentarz: lw.komentarz
    };
    this.showEditModalLW = true;
  }
  closeEditModalLW() {
    this.showEditModalLW = false;
    this.selectedLW = null;
  }
  saveEditLW() {
    if (!this.selectedLW) return;
    const payload = {
      lek_id: this.selectedLW.lek_id,
      wizyta_id: this.selectedLW.wizyta_id,
      dawka: this.editFormLW.dawka,
      komentarz: this.editFormLW.komentarz
    };
    this.http.put(`http://localhost:5001/api/lek_wizyta`, payload).subscribe({
      next: () => { this.loadAll(); this.closeEditModalLW(); },
      error: () => this.errorMsg = 'Błąd edycji leku do wizyty.'
    });
  }
  confirmDeleteLW(lw: any) {
    if (confirm('Na pewno usunąć lek z wizyty?')) {
      this.http.delete(`http://localhost:5001/api/lek_wizyta/${lw.lek_id}/${lw.wizyta_id}`).subscribe({
        next: () => this.loadAll(),
        error: () => this.errorMsg = 'Błąd usuwania leku z wizyty.'
      });
    }
  }
  getLekName(id: number) {
    const l = this.leki.find(x => x.lek_id === id);
    return l ? l.nazwa : id;
  }
  getWizytaDesc(id: number) {
    const w = this.wizyty.find(x => x.wizyta_id === id);
    return w ? `${w.data_wizyty} (pacjent_id: ${w.pacjent_id})` : id;
  }
}
