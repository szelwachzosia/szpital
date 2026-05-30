import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PracownicyComponent } from './components/pracownicy/pracownicy.component';
import { PacjentComponent } from './components/pacjent/pacjent.component';
import { OddzialComponent } from './components/oddzial/oddzial.component';
import { ZmianyComponent } from './components/zmiany/zmiany.component';
import { TestPacjentComponent } from './components/test-pacjent/test-pacjent.component';
import { LozkoComponent } from './components/lozko/lozko.component';
import { PrzedmiotyUzyteComponent } from './components/przedmioty-uzyte/przedmioty-uzyte.component';
import { PrzedmiotyComponent } from './components/przedmioty/przedmioty.component';
import { ZabiegPacjentLekarzComponent } from './components/zabieg-pacjent-lekarz/zabieg-pacjent-lekarz.component';
import { SprzetyComponent } from './components/sprzety/sprzety.component';
import { LekiPacjentComponent } from './components/leki-pacjent/leki-pacjent.component';
import { LekiComponent } from './components/leki/leki.component';
import { WizytyComponent } from './components/wizyty/wizyty.component';

export const routes: Routes = [
  { path: 'pracownicy', component: PracownicyComponent },
  { path: 'pacjent', component: PacjentComponent },
  { path: 'oddzial', component: OddzialComponent },
  { path: 'zmiany', component: ZmianyComponent },
  { path: 'test-pacjent', component: TestPacjentComponent },
  { path: 'lozko', component: LozkoComponent },
  { path: 'przedmioty-uzyte', component: PrzedmiotyUzyteComponent },
  { path: 'przedmioty', component: PrzedmiotyComponent },
  { path: 'zabieg-pacjent-lekarz', component: ZabiegPacjentLekarzComponent },
  { path: 'sprzety', component: SprzetyComponent },
  { path: 'leki-pacjent', component: LekiPacjentComponent },
  { path: 'leki', component: LekiComponent },
  { path: 'wizyty', component: WizytyComponent },
  { path: '', redirectTo: '/pracownicy', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
