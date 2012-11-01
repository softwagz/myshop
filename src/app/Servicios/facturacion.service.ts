import { Injectable } from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import { firestore } from 'firebase/app';
import { Factura } from '../Modelos/factura';


@Injectable({
  providedIn: 'root'
})
export class FacturacionService {


  constructor(private firestore:AngularFirestore) { }

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
