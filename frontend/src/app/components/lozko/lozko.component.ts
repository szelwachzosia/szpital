import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lozko',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './lozko.component.html',
  styleUrls: ['./lozko.component.css']
})
export class LozkoComponent implements OnInit {
  lozka: any[] = [];
  selectedLozko: any = null;
  showEditModal = false;
  editForm = { pokoj_nr: '', oddzial_id: '' };
  showAddModal = false;
  addForm = { pokoj_nr: '', oddzial_id: '' };
  oddzialy: any[] = [];
  errorMsg: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.http.get<any[]>('http://localhost:5001/api/lozko').subscribe(data => this.lozka = data);
    this.http.get<any[]>('http://localhost:5001/api/oddzial').subscribe(data => this.oddzialy = data);
  }

  openAddModal() {
    this.addForm = { pokoj_nr: '', oddzial_id: '' };
    this.showAddModal = true;
  }
  closeAddModal() {
    this.showAddModal = false;
  }
  saveAdd() {
    this.http.post('http://localhost:5001/api/lozko', this.addForm).subscribe({
      next: () => { this.loadAll(); this.closeAddModal(); this.errorMsg = ''; },
      error: () => this.errorMsg = 'Błąd dodawania łóżka'
    });
  }
  openEditModal(lozko: any) {
    this.selectedLozko = lozko;
    this.editForm = { ...lozko };
    this.showEditModal = true;
  }
  closeEditModal() {
    this.showEditModal = false;
    this.selectedLozko = null;
  }
  saveEdit() {
    if (!this.selectedLozko) return;
    this.http.put(`http://localhost:5001/api/lozko/${this.selectedLozko.lozko_id}`, this.editForm).subscribe({
      next: () => { this.loadAll(); this.closeEditModal(); this.errorMsg = ''; },
      error: () => this.errorMsg = 'Błąd edycji łóżka'
    });
  }
  confirmDelete(lozko: any) {
    if (confirm('Na pewno usunąć łóżko?')) {
      this.http.delete(`http://localhost:5001/api/lozko/${lozko.lozko_id}`).subscribe({
        next: () => { this.loadAll(); this.errorMsg = ''; },
        error: () => this.errorMsg = 'Błąd usuwania łóżka'
      });
    }
  }
  getOddzialName(id: number) {
    const o = this.oddzialy.find(x => x.oddzial_id === id);
    return o ? o.nazwa : '';
  }
}
