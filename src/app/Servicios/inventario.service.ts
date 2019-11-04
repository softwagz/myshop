import { Injectable } from '@angular/core';
import { NgForm } from '@angular/forms';
import {AngularFirestore} from '@angular/fire/firestore';
import {firestore} from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  constructor(private firestore:AngularFirestore) { }


  registerArticle(user:string,forms:NgForm){
    let data = Object.assign({},forms.value);
    delete data.fechaVencimiento;
    delete data.cantidad;
    return this.firestore.collection('users').doc(user).collection('articulos').doc(data.codigo).set(data);

  }
  registerVencimientoArticle(user:string,form:NgForm){
    let data = Object.assign({},form.value);
    delete data.iva;
    delete data.stockMinimo;
    delete data.stockMaximo;
    delete data.descripcion;
    delete data.precio;
    delete data.precioVenta;
    delete data.presentacion;
    delete data.descuento;
    let fechaBase = form.value.fecha;
    let fecha = firestore.Timestamp.fromDate(new Date(fechaBase));
    data.fecha = fecha;

    return this.firestore.collection('users').doc(user).collection('vencimientoArticulos').add(data);    

  }
  loadArticuloVencimiento(user:string){
    return this.firestore.collection('users').doc(user).collection('vencimientoArticulos').snapshotChanges();
  }
  deleteArticle(user:string,id:string){
    return this.firestore.collection('users').doc(user).collection('articulos').doc(id).delete ();
    //falta eliminar las fechas de vencimiento asociadas
  }
  loadArticle(user:string){
    return this.firestore.collection('users').doc(user).collection('articulos').snapshotChanges();
  }
 
}
