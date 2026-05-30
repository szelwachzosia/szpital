import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-oddzial',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './oddzial.component.html',
  styleUrls: ['./oddzial.component.css']
})
export class OddzialComponent implements OnInit {
  oddzialy: any[] = [];
  selectedOddzial: any = null;
  showEditModal = false;
  editForm = {
    nazwa: '', pielegniarka_id: '', ordynator_id: ''
  };
  showAddModal = false;
  addForm = {
    nazwa: '', pielegniarka_id: '', ordynator_id: ''
  };
  pielegniarki: any[] = [];
  ordynatorzy: any[] = [];
  errorMsg: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadOddzialy();
  }

  loadOddzialy() {
    this.http.get<any[]>('http://localhost:5000/api/oddzial').subscribe(data => this.oddzialy = data);
    this.http.get<any[]>('http://localhost:5000/api/pracownicy').subscribe(data => {
      this.pielegniarki = data.filter(p => p.stanowisko === 'pielegniarka');
      this.ordynatorzy = data.filter(p => p.stanowisko === 'ordynator');
    });
  }

  openEditModal(oddzial: any) {
    this.selectedOddzial = oddzial;
    this.editForm = { ...oddzial };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedOddzial = null;
  }

  saveEdit() {
    if (!this.selectedOddzial) return;
    this.http.put(`http://localhost:5000/api/oddzial/${this.selectedOddzial.oddzial_id}`, this.editForm)
      .subscribe({
        next: () => { this.closeEditModal(); this.loadOddzialy(); this.errorMsg = ''; },
        error: () => this.errorMsg = 'Błąd edycji oddziału'
      });
  }

  openAddModal() {
    this.addForm = { nazwa: '', pielegniarka_id: '', ordynator_id: '' };
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  saveAdd() {
    this.http.post('http://localhost:5000/api/oddzial', this.addForm)
      .subscribe({
        next: () => { this.closeAddModal(); this.loadOddzialy(); this.errorMsg = ''; },
        error: () => this.errorMsg = 'Błąd dodawania oddziału'
      });
  }

  confirmDelete(oddzial: any) {
    if (confirm(`Czy na pewno chcesz usunąć oddział: ${oddzial.nazwa}?`)) {
      this.http.delete(`http://localhost:5000/api/oddzial/${oddzial.oddzial_id}`)
        .subscribe({
          next: () => { this.loadOddzialy(); this.errorMsg = ''; },
          error: () => this.errorMsg = 'Błąd usuwania oddziału'
        });
    }
  }
}
