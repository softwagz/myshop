import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import  {LoginService} from '../Servicios/login.service';
import {AngularFireAuth} from '@angular/fire/auth';
import {Router} from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private service:LoginService, private auth:AngularFireAuth,private router:Router){

  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      this.service.authState().subscribe(resultado => {
        if(!resultado){
          this.router.navigate(['/login']);
          return false;
        }
      })
    return true;
  }
  
}
