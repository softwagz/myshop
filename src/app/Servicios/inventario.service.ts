import { Injectable } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';
import { VencimientoArticulo } from '../Modelos/vencimiento-articulo';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  constructor(private firestore: AngularFirestore, private auth: AngularFireAuth) { }

  todasFechas: VencimientoArticulo[];

  registerArticle(user: string, forms: NgForm) {
    let data = Object.assign({}, forms.value);
    delete data.fecha;
    delete data.cantidad;
    return this.firestore.collection('users').doc(user).collection('articulos').doc(data.codigo).set(data);

  }
  registerVencimientoArticle(user: string, form: NgForm) {
    let data = Object.assign({}, form.value);
    console.log(data);
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
  actualizarCantidadDisponible(user: string, dats: any) {
    let id= dats.codigo;
    delete dats.codigo;

    this.firestore.doc('users/' + user + '/articulos/' +id).update(dats);

  }
  loadArticuloVencimiento(user: string) {
    return this.firestore.collection('users').doc(user).collection('vencimientoArticulos').snapshotChanges();
  }
  deleteArticle(user: string, id: string) {
    return this.firestore.collection('users').doc(user).collection('articulos').doc(id).delete();
    //falta eliminar las fechas de vencimiento asociadas
  }
  deleteVencimientoArticle(user: string, id: string) {
    return this.firestore.collection('users').doc(user).collection('vencimientoArticulos').doc(id).delete();
  }
  loadArticle(user: string) {
    return this.firestore.collection('users').doc(user).collection('articulos').snapshotChanges();
  }
  editArticle(form: NgForm, user: string) {
    let data = Object.assign({}, form.value);
    delete data.id;
    return this.firestore.doc('users/' + user + '/articulos/' + form.value.id).update(data);
  }



}
