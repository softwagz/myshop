import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';



@Injectable({
  providedIn: 'root'
})
export class FacturacionService {


  constructor(private firestore: AngularFirestore) { }

  cargarArticulos(user: string) {
    return this.firestore.collection('users').doc(user).collection('articulos').snapshotChanges();
  }

  cargarFacturas(user: string) {
    return this.firestore.collection('users').doc(user).collection('facturacontado').snapshotChanges();

  }
  loadArticuloVencimiento(user: string) {
    return this.firestore.collection('users').doc(user).collection('vencimientoArticulos').snapshotChanges();
  }
  registrarFactura(user: string, form: any, articles: any, tipo: number) {
    let data = Object.assign({}, form.value);
  

    if (tipo === 1) {
      delete data.abonoF;
      delete data.restaPorCobrar;
      return this.firestore.collection('users').doc(user).collection('facturacontado').add(data);

    } else {
      return this.firestore.collection('users').doc(user).collection('facturasPorCobrar').add(data);

    }

  }

  eliminarFactura() {

  }
  buscarFacturaFecha() {

  }
  buscarFacturaUnica() {

  }
  buscarFacturaIntervalo() {

  }


}
