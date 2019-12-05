import { Component, OnInit, Input } from '@angular/core';
import {NgForm} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {LoginService} from '../../Servicios/login.service';
import {Router} from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']

})
export class LoginComponent implements OnInit {

  email:string="";
  password:string="";
  isLoged:boolean=false;
  constructor(private service:LoginService,private router:Router, private toas:ToastrService) { }

  ngOnInit() {
    this.service.authState().subscribe(resultado =>{
      if(resultado){
        this.isLoged=true;
        this.router.navigate(['/principal']);
      }else{
        this.isLoged=false;
        console.log(resultado);
      }
    })
  }

  



  loginUser(form:NgForm){
    this.service.logUser(this.email,this.password).then(
      resultado => {
        if(resultado){
          this.isLoged=true;
          this.resetForm(form);
          this.router.navigate(['/principal']);
          this.toas.success('Acceso Exitoso','Validacion');
        }
        
      },
      error =>{
          this.isLoged=false;
          this.toas.error('Por favor, verifique los datos ingresados','Error al Validar');
          console.log(error);
      }
    )

  }
  resetForm(form:NgForm){
    form.resetForm();
  }

  
}
