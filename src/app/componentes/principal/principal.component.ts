import { Component, OnInit } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {ToastrService} from 'ngx-toastr';
@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css']
})
export class PrincipalComponent implements OnInit {

  
  constructor(private auth:AngularFireAuth, private toas:ToastrService) { }

  ngOnInit() {
  }

  singOut(){
    this.auth.auth.signOut();
    this.toas.show('Su sesion ha finalizado correctamente','Cerrando Session');
  }

}
