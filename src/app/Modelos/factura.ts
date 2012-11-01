import {Cliente} from './cliente';
import {Articulo} from './articulo';
export class Factura {

id:string;
fecha:Date;
numeroFactura:string;
cliente:Cliente;
articulos:Articulo[];
tipoVenta:number;
tipoCliente:number;


}
