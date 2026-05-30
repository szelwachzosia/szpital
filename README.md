# Hospital Management System

Zaawansowana aplikacja webowa do zarządzania szpitalem, obejmująca obsługę pacjentów, pracowników, leków, vizyt i zabiegów medycznych.

## Funkcjonalności

- **Zarządzanie pracownikami** - dodawanie, edycja, usuwanie pracowników
- **Zarządzanie pacjentami** - rejestracja i monitorowanie pacjentów
- **Zarządzanie oddziałami** - organizacja oddziałów z przypisanymi personelem
- **System leków** - katalog leków i przypisanie do pacjentów
- **Wizyty medyczne** - scheduling i rejestracja wizyt
- **Zabiegi medyczne** - zarządzanie procedurami medycznymi
- **Sprzęt medyczny** - inwentaryzacja i przypisanie sprzętu
- **Testy medyczne** - dokumentacja badań laboratoryjnych
- **Szczegółowe raporty** - analiza danych pacjentów

## Struktura projektu

```
projekt/
├── backend/              # API Flask + SQLite
│   ├── app.py           # Główna aplikacja
│   ├── requirements.txt  # Zależności Python
│   └── db/              # Baza danych SQLite
└── frontend/            # Aplikacja Angular
    ├── src/
    │   ├── app/
    │   │   ├── components/  # Komponenty UI
    │   │   ├── app.routes.ts
    │   │   └── app.config.ts
    │   └── main.ts
    ├── package.json
    └── angular.json
```

## Szybki start

### Wymagania
- Node.js (v18+)
- Python 3.8+
- npm lub yarn

### Instalacja i uruchamianie

#### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Backend będzie dostępny na `http://localhost:5000`

#### Frontend
```bash
cd frontend
npm install
npm start
```
Frontend będzie dostępny na `http://localhost:4200`

## Dokumentacja

### Frontend - Strony główne
![Dashboard](.attachments/dashboard.png)
*Strona główna aplikacji z menu nawigacyjnym*

![Navbar](.attachments/navbar.png)
*Pasek nawigacji z linkami do poszczególnych modulów*

### Zarządzanie pracownikami
![Lista pracowników](.attachments/pracownicy-lista.png)
*Widok listy wszystkich pracowników szpitala*

![Edycja pracownika](.attachments/pracownicy-edycja.png)
*Formularz do dodawania lub edycji danych pracownika*

### Zarządzanie pacjentami
![Lista pacjentów](.attachments/pacjenci-lista.png)
*Przeglądanie wszystkich pacjentów w systemie*

![Szczegóły pacjenta](.attachments/pacjent-szczegoly.png)
*Kompletne informacje o pacjencie*

### Lekarstwa
![Lista leków](.attachments/leki-lista.png)
*Katalog dostępnych leków w szpitalu*

![Leki pacjenta](.attachments/leki-pacjent.png)
*Lekarstwa przypisane konkretnemu pacjentowi*

### Wizyty i zabiegi
![Lista wizyt](.attachments/wizyty-lista.png)
*Harmonogram wizyt medycznych*

![Lista zabiegów](.attachments/zabiegi-lista.png)
*Zabiegi medyczne wykonane na pacjentach*

### Oddział
![Szczegóły oddziału](.attachments/oddział-szczegoly.png)
*Informacje o oddziale i jego personelu*

### Testy medyczne
![Testy pacjenta](.attachments/testy-pacjent.png)
*Wyniki testów laboratoryjnych pacjenta*

## Stack technologiczny

**Backend:**
- Python 3
- Flask
- SQLite
- Flask-CORS

**Frontend:**
- Angular 19
- TypeScript
- Bootstrap 5
- RxJS

## Baza danych

Projekt wykorzystuje SQLite z następującymi tabelami:
- Pracownicy
- Pacjenci
- Oddział
- Leki
- Wizyty
- Zabiegi
- Testy
- Przedmioty/Sprzęt
- Lozka (łóżka pacjentów)

## Licencja

Projekt utworzony na potrzeby szkolenia/kursu.

## Autor

Hospital Management System - 2026
