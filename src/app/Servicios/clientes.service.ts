import { Injectable } from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';


@Injectable({
  providedIn: 'root'
})
export class ClientesService {



  constructor(private firestore:AngularFirestore) { }

  editCliente(form:NgForm,user:string){
    let data = Object.assign({},form.value);
    delete data.id;
   //return this.firestore.collection('users').doc(user).collection('clientes').doc(form.value.id).update(data);
   return this.firestore.doc('users/'+user+'/clientes/'+form.value.id).update(data);
  }

  deleteCliente(id:string,user:string){
    return this.firestore.collection('users').doc(user).collection('clientes').doc(id).delete();
  }

  registerClient(data:any, user:string){
    return this.firestore.collection('users').doc(user).collection('clientes').add(data);
  }

  loadClient(usuario:string){
    return this.firestore.collection('users').doc(usuario).collection('clientes').snapshotChanges();
  }
}
