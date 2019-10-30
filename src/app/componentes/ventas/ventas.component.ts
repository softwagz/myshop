import { Component, OnInit } from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {AngularFireAuth} from '@angular/fire/auth';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class VentasComponent implements OnInit {

  constructor(private toas:ToastrService, private auth:AngularFireAuth) { }

  ngOnInit() {
  }
  singOut(){
    this.auth.auth.signOut();
    this.toas.show('Su sesion ha finalizado correctamente','Cerrando Session');
  }

}
