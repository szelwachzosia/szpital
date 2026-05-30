import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-przedmioty',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './przedmioty.component.html',
  styleUrl: './przedmioty.component.css'
})
export class PrzedmiotyComponent implements OnInit {
  przedmioty: any[] = [];
  errorMsg = '';
  addForm = { nazwa: '', typ: '', producent: '', ilosc: '', koszt_jednostkowy: '', ulotka: '' };
  editForm = { przedmiot_id: '', nazwa: '', typ: '', producent: '', ilosc: '', koszt_jednostkowy: '', ulotka: '' };
  showAddModal = false;
  showEditModal = false;
  selectedPrzedmiot: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPrzedmioty();
  }

  loadPrzedmioty() {
    this.http.get<any[]>('http://localhost:5000/api/przedmioty').subscribe({
      next: data => this.przedmioty = data,
      error: err => this.errorMsg = 'Błąd pobierania przedmiotów.'
    });
  }

  openAddModal() {
    this.addForm = { nazwa: '', typ: '', producent: '', ilosc: '', koszt_jednostkowy: '', ulotka: '' };
    this.errorMsg = '';
    this.showAddModal = true;
  }
  closeAddModal() { this.showAddModal = false; }

  saveAdd() {
    this.http.post<any>('http://localhost:5000/api/przedmioty', this.addForm).subscribe({
      next: () => {
        this.loadPrzedmioty();
        this.closeAddModal();
      },
      error: err => this.errorMsg = 'Błąd dodawania przedmiotu.'
    });
  }

  openEditModal(przedmiot: any) {
    this.selectedPrzedmiot = przedmiot;
    this.editForm = { ...przedmiot };
    this.errorMsg = '';
    this.showEditModal = true;
  }
  closeEditModal() { this.showEditModal = false; }

  saveEdit() {
    this.http.put<any>(`http://localhost:5000/api/przedmioty/${this.editForm.przedmiot_id}`, this.editForm).subscribe({
      next: () => {
        this.loadPrzedmioty();
        this.closeEditModal();
      },
      error: err => this.errorMsg = 'Błąd edycji przedmiotu.'
    });
  }

  confirmDelete(przedmiot: any) {
    if (confirm('Czy na pewno chcesz usunąć ten przedmiot?')) {
      this.http.delete<any>(`http://localhost:5000/api/przedmioty/${przedmiot.przedmiot_id}`).subscribe({
        next: () => this.loadPrzedmioty(),
        error: err => this.errorMsg = 'Błąd usuwania przedmiotu.'
      });
    }
  }
}
