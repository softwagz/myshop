import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AngularFireAuth } from '@angular/fire/auth';
import * as $ from 'jquery';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.css']
})
export class ProveedoresComponent implements OnInit {

  constructor(private toas: ToastrService, private auth: AngularFireAuth) { }

  ngOnInit() {
/*  */

  }
  singOut() {
    this.auth.auth.signOut();
    this.toas.show('Su sesion ha finalizado correctamente', 'Cerrando Session');
  }


}
