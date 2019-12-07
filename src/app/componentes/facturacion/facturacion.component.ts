import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { ToastrService } from 'ngx-toastr';
import { FacturacionService } from '../../Servicios/facturacion.service';
import { Articulo } from 'src/app/Modelos/articulo';
import { Cliente } from 'src/app/Modelos/cliente';
import { Factura } from 'src/app/Modelos/factura';
import * as $ from 'jquery';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-facturacion',
  templateUrl: './facturacion.component.html',
  styleUrls: ['./facturacion.component.css']
})
export class FacturacionComponent implements OnInit {

  constructor(private toas: ToastrService,
    private auth: AngularFireAuth,
    private facturacionService: FacturacionService, private formBuilder: FormBuilder) {

  }

  facturaForm: FormGroup;

  estadoBusquedaArticulo: boolean = false;
  estadoBusquedaCliente: boolean = false;
  turnTipoVenta: boolean = false;
  turnTipoCliente: boolean = false;
  dataArticulo: Articulo[];
  facturas: Factura[];
  searchState: boolean = false;
  resultState:boolean =false;
  searchData: Articulo[]=[];
  searchMode:boolean=false;
  search:string;


  articuloSelected = {
    id: "",
    codigo: "",
    descripcion: "",
    presentacion: "",
    stockMinimo: 0,
    stockMaximo: 0,
    iva: true,
    descuento: 0,
    precio: 0,
    precioVenta: 0
  }
  carrito: Array<Articulo> = [];
  totalCompra:number=0;
  subtotal:number=0;
  descuento:number=0;
  totalPagar:number=0;
  iva:number=0;
  abono:number=0;

  ngOnInit() {
    this.cargarArticulos();
    this.facturaForm = new FormGroup({
      identificacion: new FormControl('', [Validators.required, Validators.minLength(5), Validators.pattern(this.validarNumero)]),
      nombre: new FormControl('', [Validators.required, Validators.minLength(5), Validators.pattern(this.validarLetras)]),
      apellido: new FormControl('', [Validators.required, Validators.minLength(5), Validators.pattern(this.validarLetras)]),
      telefono: new FormControl('', [Validators.required, Validators.minLength(5), Validators.pattern(this.validarNumero)]),
      direccion: new FormControl('', [Validators.required, Validators.minLength(5)]),
      subtotal:new FormControl('',[]),
      descuentoF: new FormControl('',[Validators.pattern(this.validarNumero)]),
      iva:new FormControl('',[]),
      totalPagar:new FormControl('',[]),
      restaPorCobrar:new FormControl('',[]),
      abonoF: new FormControl('',[Validators.pattern(this.validarNumero)])
    });
  }

  validarNumero: any = /^\d*$/;
  validarLetras: any = /^([a-zA-z])*$/;

  cargarArticulos() {
    this.facturacionService.cargarArticulos(this.auth.auth.currentUser.email).subscribe(
      resultado => {
        this.dataArticulo = resultado.map(
          items => {
            return {
              id: items.payload.doc.id,
              ...items.payload.doc.data()
            } as Articulo;
          }
        );
      }
    );
  }
  tipoCliente() {
    if (this.turnTipoCliente) {
      this.turnTipoCliente = false;
    }
    else {
      this.turnTipoCliente = true;
    }

    this.limpiarFormulario();
  }
  tipoVenta() {
    if (this.turnTipoVenta) {
      this.turnTipoVenta = false;
    } else {
      this.turnTipoVenta = true;

    }
  }
  cargarFacturas() {

    this.facturacionService.cargarFacturas(this.auth.auth.currentUser.email).subscribe(
      resultado => {
        this.facturas = resultado.map(
          items => {
            return {
              id: items.payload.doc.id,
              ...items.payload.doc.data()
            } as Factura
          }
        )
      }
    )

  }

  agregarAlCarrito(articulo: Articulo) {
    console.log(articulo);
    var index = this.carrito.indexOf(articulo);
    if(index === -1){
      articulo.cantidadCompra=1;
      this.carrito.push(articulo);
    }else{
      this.carrito[index].cantidadCompra += 1;
    }
    this.calcularTotalCompra();
    this.calcularSubtotal();
    this.calcularIva();
    this.calcularTotalPagar();
    console.log(this.descuento);

  }

  bajarDelCarrito(item: number) {
    delete this.carrito[item];
  }

  buscarCliente() {

  }

  calcularTotalCompra(){
    this.totalCompra=0;
    for(let i = 0; i < this.carrito.length;i++){
      this.totalCompra += this.carrito[i].cantidadCompra * this.carrito[i].precioVenta;
    }

  }

  calcularSubtotal(){
    if(this.totalCompra>0){
      this.subtotal = this.totalCompra - (this.totalCompra * 0.12);
    }
  }
  
  calcularTotalPagar() {
      
    this.descuento = this.facturaForm.get('descuentoF').value;
    if((this.descuento>=0 || this.descuento===null) && this.subtotal>=this.descuento){
      this.totalPagar = this.subtotal + this.iva - this.descuento;
      this.calcularRestaPorPagar()
    }else if(this.descuento>this.subtotal){
      Swal.fire('Error','el Descuento es mayor que el subtotal, no se tomara en cuenta','info');
      this.descuento=0;
      this.facturaForm.get('descuentoF').setValue(this.descuento);
      this.totalPagar = this.subtotal + this.iva;
      this.calcularRestaPorPagar()
    }

  }

  calcularIva(){

    this.iva = 0;

    this.iva = this.totalCompra * 0.12;

  }

  calcularRestaPorPagar(){
    if(this.totalPagar>0){
    this.abono = this.facturaForm.get('abonoF').value;
    var pendiente = this.totalPagar - this.abono;
    this.facturaForm.get('restaPorCobrar').setValue(pendiente);

    }else{
      Swal.fire('Aviso','Registra Primero los productos','info');
    }
  }

  singOut() {
    this.auth.auth.signOut();
    this.toas.show('Su sesion ha finalizado correctamente', 'Cerrando Session');
  }

  saveForm() {
    if (this.facturaForm.valid) {
      Swal.fire('Valido', 'Formulario correcto', 'success');
    } else {
      Swal.fire('error', 'no valido', 'error')
    }
  }
  limpiarFormulario() {
      this.facturaForm.reset();
      this.carrito.splice(0);
      this.descuento=0;
      this.subtotal=0;
      this.iva=0;
      this.totalPagar=0;
      this.abono=0;
      this.facturaForm.get('descuentoF').setValue(this.descuento);
      this.facturaForm.get('subtotal').setValue(this.subtotal);
      this.facturaForm.get('iva').setValue(this.iva);
      this.facturaForm.get('totalPagar').setValue(this.totalPagar);
      this.facturaForm.get('abonoF').setValue(this.abono);
  }

  limpiarCarrito(){
    this.carrito.splice(0);
    this.descuento=0;
      this.subtotal=0;
      this.iva=0;
      this.totalPagar=0;
      this.abono=0;
      this.facturaForm.get('descuentoF').setValue(this.descuento);
      this.facturaForm.get('subtotal').setValue(this.subtotal);
      this.facturaForm.get('iva').setValue(this.iva);
      this.facturaForm.get('totalPagar').setValue(this.totalPagar);
      this.facturaForm.get('abonoF').setValue(this.abono);

  }

  //Metodos de la busqueda
  switchModeSearch(){
    if(!this.searchMode){
      this.searchMode=true;
    }else{
      this.searchMode=false;
    }
  }


  searchArticle(word: string) {
    if(!this.searchMode){
      if (word != "" && word != undefined) {
        this.searchData = this.dataArticulo.filter(function (val) {
          return (val.codigo.toLowerCase().startsWith(word.toLowerCase()));
        });
        this.searchState = true;
        if (this.searchData.length > 0) {
          this.resultState = true;
        } else {
          this.resultState = false;
        }
      } else {
        this.searchState = false;
        this.resultState = false;
      }
    }else{
      if (word != "" && word != undefined) {
        this.searchData = this.dataArticulo.filter(function (val) {
          return (val.descripcion.toLowerCase().startsWith(word.toLowerCase()));
        });
        this.searchState = true;
        if (this.searchData.length > 0) {
          this.resultState = true;
        } else {
          this.resultState = false;
        }
      } else {
        this.searchState = false;
        this.resultState = false;
      }

    }
  }

  clearSearch() {
    this.searchArticle("");

  }


  //Variable para el fomrulario

  get identificacion() {
    return this.facturaForm.get('identificacion');
  }
  get nombre() {
    return this.facturaForm.get('nombre');
  }
  get apellido() {
    return this.facturaForm.get('apellido');
  }
  get direccion() {
    return this.facturaForm.get('direccion');
  }
  get telefono() {
    return this.facturaForm.get('telefono');
  }
  get descuentoF(){
    return this.facturaForm.get('descuentoF');
  }

  get abonoF(){
    return this.facturaForm.get('abonoF')
  }

}
