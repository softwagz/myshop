import { Injectable } from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore'; 
import {AngularFireAuth} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private firestore:AngularFirestore, private auth:AngularFireAuth) {

   }

   logUser(email:string,password:string){
    return new Promise((resolve,reject) => {
      this.auth.auth.signInWithEmailAndPassword(email,password).
      then(resultado => {
        resolve(resultado);
      },
      error => {
        reject(error);
      }
      );
    });
   }
   
   authState(){
     return this.auth.authState;
   }



}
