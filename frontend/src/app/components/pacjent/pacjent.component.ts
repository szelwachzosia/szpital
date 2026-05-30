import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pacjent',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './pacjent.component.html',
  styleUrls: ['./pacjent.component.css']
})
export class PacjentComponent implements OnInit {
  pacjenci: any[] = [];
  lekarze: any[] = [];
  lozka: any[] = [];
  choroby: any[] = [];
  selectedPacjent: any = null;
  showEditModal = false;
  editForm = {
    imie: '', nazwisko: '', adres: '', data_urodzenia: '', data_przyjecia: '', data_wypisu: '', najblizsi: '', przyjecie_rodzaj: '', id_lekarza_kierujacego: '', lozko_id: '', choroby: ''
  };
  showAddModal = false;
  addForm = {
    imie: '', nazwisko: '', adres: '', data_urodzenia: '', data_przyjecia: '', data_wypisu: '', najblizsi: '', przyjecie_rodzaj: '', id_lekarza_kierujacego: '', lozko_id: '', choroby: ''
  };
  errorMsg = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAll();
    this.http.get<any[]>('http://localhost:5001/api/pracownicy').subscribe(data => {
      this.lekarze = data.filter(p => p.stanowisko === 'lekarz');
    });
    this.http.get<any[]>('http://localhost:5001/api/lozko').subscribe(data => this.lozka = data);
  }

  loadAll() {
    this.http.get<any[]>('http://localhost:5001/api/pacjent').subscribe(data => this.pacjenci = data);
  }

  loadPacjenci() {
    this.loadAll();
  }

  getLekarzName(id: number) {
    const l = this.lekarze.find(x => x.pracownik_id === id);
    return l ? `${l.imie} ${l.nazwisko}` : id;
  }

  getLozkoName(id: number) {
    const l = this.lozka.find(x => x.lozko_id === id);
    return l ? l.nazwa || l.lozko_id : id;
  }

  getChorobyNames(chorobyStr: string) {
    if (!chorobyStr) return '';
    const ids = chorobyStr.split(',').map((x: string) => +x);
    return this.choroby.filter(c => ids.includes(c.choroba_id)).map(c => c.nazwa).join(', ');
  }

  openEditModal(pacjent: any) {
    this.selectedPacjent = pacjent;
    this.editForm = { ...pacjent };
    if (Array.isArray(this.editForm.choroby)) {
      this.editForm.choroby = this.editForm.choroby.join(',');
    }
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedPacjent = null;
  }

  saveEdit() {
    if (!this.selectedPacjent) return;
    this.http.put(`http://localhost:5001/api/pacjent/${this.selectedPacjent.pacjent_id}`, this.editForm)
      .subscribe(() => {
        this.closeEditModal();
        this.loadAll();
      });
  }

  openAddModal() {
    this.addForm = {
      imie: '', nazwisko: '', adres: '', data_urodzenia: '', data_przyjecia: '', data_wypisu: '', najblizsi: '', przyjecie_rodzaj: '', id_lekarza_kierujacego: '', lozko_id: '', choroby: ''
    };
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  saveAdd() {
    this.http.post('http://localhost:5001/api/pacjent', this.addForm)
      .subscribe(() => {
        this.closeAddModal();
        this.loadAll();
      });
  }

  confirmDelete(pacjent: any) {
    if (confirm(`Czy na pewno chcesz usunąć pacjenta: ${pacjent.imie} ${pacjent.nazwisko}?`)) {
      this.http.delete(`http://localhost:5001/api/pacjent/${pacjent.pacjent_id}`)
        .subscribe(() => this.loadAll());
    }
  }
}
