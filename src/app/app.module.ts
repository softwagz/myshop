import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import {AngularFireModule} from '@angular/fire';
import {AngularFirestoreModule } from '@angular/fire/firestore';
import {FormsModule,ReactiveFormsModule} from '@angular/forms';
import {LoginService} from './Servicios/login.service';
import {ClientesService} from './Servicios/clientes.service';
import {AngularFireAuthModule,AngularFireAuth} from '@angular/fire/auth';
import {Routes,RouterModule} from '@angular/router';
import {ToastrModule} from 'ngx-toastr';
import {AuthGuard} from './seguridad/auth.guard';

import { AppComponent } from './app.component';
import { LoginComponent } from './componentes/login/login.component';
import { environment } from 'src/environments/environment';
import { PrincipalComponent } from './componentes/principal/principal.component';
import { ClientesComponent } from './componentes/clientes/clientes.component';
import { InventarioComponent } from './componentes/inventario/inventario.component';
import { FacturacionComponent } from './componentes/facturacion/facturacion.component';
import { ProveedoresComponent } from './componentes/proveedores/proveedores.component';
import { VentasComponent } from './componentes/ventas/ventas.component';
import { InventarioService } from './Servicios/inventario.service';


const rout:Routes = [
  {path:'',component: LoginComponent},
  {path:'clientes',component: ClientesComponent, canActivate:[AuthGuard]},
  {path:'facturas',component: FacturacionComponent, canActivate:[AuthGuard]},
  {path:'inventario',component: InventarioComponent, canActivate:[AuthGuard]},
  {path:'proveedores',component: ProveedoresComponent, canActivate:[AuthGuard]},
  {path:'principal',component: PrincipalComponent, canActivate:[AuthGuard]},
  {path:'ventas',component: VentasComponent, canActivate:[AuthGuard]},
  {path:'**',component: LoginComponent}
];


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PrincipalComponent,
    ClientesComponent,
    InventarioComponent,
    FacturacionComponent,
    ProveedoresComponent,
    VentasComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    FormsModule,ReactiveFormsModule,
    RouterModule.forRoot(rout),
    AngularFireAuthModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule
  ],
  providers: [LoginService,ClientesService,InventarioService,AngularFireAuth,AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
