import {Cliente} from './cliente';
import {Articulo} from './articulo';
export class Factura {

id:string;
apellido:string;
descuentoF:string;
direccion:string;
identificacion:string;
iva:number;
nombre:string;
subtotal:number;
telefono:string;
totalPagar:number;
fecha:Date;
restaPorCobrar:number;
/* fecha:Date;
 numeroFactura:string;*/
articulos:Articulo[];

}
