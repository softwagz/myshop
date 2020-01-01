import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  constructor(private firestore:AngularFirestore) { }

  cargarFacturasContado(user: string) {
    return this.firestore.collection('users').doc(user).collection('facturacontado').snapshotChanges();

  }

  cargarFacturasCredito(user: string) {
    return this.firestore.collection('users').doc(user).collection('facturasporcobrar').snapshotChanges();

  }

  actualizarRestaPorCobrar(user:string,id:string,monto:any){
    let data = Object.assign({},{restaPorCobrar:monto});
    console.log(id);
    console.log(data);
    return this.firestore.doc('users/'+user+'/facturasporcobrar/'+id).update(data);

  }

}
