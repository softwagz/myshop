import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { ToastrService } from 'ngx-toastr';
import {FacturacionService} from '../../Servicios/facturacion.service';
import {Articulo} from 'src/app/Modelos/articulo';
import {Cliente} from 'src/app/Modelos/cliente';
import {Factura} from 'src/app/Modelos/factura';
import * as $ from 'jquery';


@Component({
  selector: 'app-facturacion',
  templateUrl: './facturacion.component.html',
  styleUrls: ['./facturacion.component.css']
})
export class FacturacionComponent implements OnInit {

  constructor(private toas:ToastrService,
    private auth:AngularFireAuth,
    private facturacionService:FacturacionService) { }

  estadoBusquedaArticulo:boolean=false;
  estadoBusquedaCliente:boolean=false;
  turnTipoVenta:boolean=false;
  turnTipoCliente:boolean=false;
  carrito:Articulo[];
  facturas:Factura[];

  ngOnInit() {
  
  }
  prueba(){
    if(this.turnTipoCliente){
      this.turnTipoCliente=false;
    }
    else{
      this.turnTipoCliente=true;
    }
  }
  cargarFacturas(){

    this.facturacionService.cargarFacturas(this.auth.auth.currentUser.email).subscribe(
      resultado => {
        this.facturas = resultado.map(
          items => {
            return {
              id:items.payload.doc.id,
              ...items.payload.doc.data()
            } as Factura
          }
        )
      }
    )

  }

  agregarAlCarrito(articulo:Articulo){
    this.carrito.push(articulo);
  }
  bajarDelCarrito(item:number){
    delete this.carrito[item];
  }
  
  tipoCliente(){

  }
  buscarCliente(){

  }
  calcularDescuento(){

  }

  calcularSubtotal(){

  }

  calcularTotalPagar(){

  }
  

  singOut(){
    this.auth.auth.signOut();
    this.toas.show('Su sesion ha finalizado correctamente','Cerrando Session');
  }
}
