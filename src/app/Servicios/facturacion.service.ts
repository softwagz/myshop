import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';



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
  registrarFactura(user: string, form: any, tipo: number) {
    let data = Object.assign({}, form.value);


    if (tipo === 1) {
      delete data.abonoF;
      delete data.restaPorCobrar;
      return this.firestore.collection('users').doc(user).collection('facturacontado').add(data);

    } else {
      return this.firestore.collection('users').doc(user).collection('facturasporcobrar').add(data);

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

  //actualizar cantidad de las fechas de vencicmiento
  actualizarCantidad(formulario: any, user: string) {
    let data = Object.assign({}, formulario);
    delete data.id;
    delete data.codigo;
    delete data.fecha;
    return this.firestore.doc('users/' + user + '/vencimientoArticulos/' + formulario.id).update(data);


  }

  actualizarCantidadArticulo(codigo:string,num:number,user:string){
    let data = {cantidadDisponible:num.toString()};
    let update =Object.assign({},data);
    console.log(update);
    return this.firestore.doc('users/' + user + '/articulos/' + codigo).update(update);

  }

}
