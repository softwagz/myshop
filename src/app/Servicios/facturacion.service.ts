import { Injectable } from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import { firestore } from 'firebase/app';



@Injectable({
  providedIn: 'root'
})
export class FacturacionService {


  constructor(private firestore:AngularFirestore) { }

  cargarArticulos(user:string){
    return this.firestore.collection('users').doc(user).collection('articulos').snapshotChanges();
  }

  cargarFacturas(user:string){
    return this.firestore.collection('users').doc(user).collection('facturas').snapshotChanges();

  }
  registrarFactura(){

  }

  eliminarFactura(){

  }
  buscarFacturaFecha(){

  }
  buscarFacturaUnica(){

  }
  buscarFacturaIntervalo(){

  }

  
}
