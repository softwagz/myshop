import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { ToastrService } from 'ngx-toastr';
import { FacturacionService } from '../../Servicios/facturacion.service';
import { Articulo } from 'src/app/Modelos/articulo';
import { VencimientoArticulo } from 'src/app/Modelos/vencimiento-articulo';
import { Factura } from 'src/app/Modelos/factura';
import * as $ from 'jquery';
import Swal from 'sweetalert2';
import { firestore } from 'firebase';


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

  ivaBase: number = 0.19;
  statusClienteDefault: boolean = false;
  facturaForm: FormGroup;
  estadoBusquedaArticulo: boolean = false;
  estadoBusquedaCliente: boolean = false;
  turnTipoVenta: boolean = false;
  turnTipoCliente: boolean = false;
  dataArticulo: Articulo[];
  facturas: Factura[];
  facturaFilter: Factura[] = [];
  searchState: boolean = false;
  resultState: boolean = false;
  searchData: Articulo[] = [];
  listVencimiento = [];
  fechasVencimientoArticulo: VencimientoArticulo[];
  contar: number = 0;
  searchMode: boolean = false;
  search: string;
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
  totalCompra: number = 0;
  subtotal: number = 0;
  descuento: number = 0;
  totalPagar: number = 0;
  iva: number = 0;
  abono: number = 0;
  porCobrar: number = 0;
  gananciaDelDia: number = 0;
  totalVendido: number = 0;
  validarNumero: any = /^\d*$/;
  validarLetras: any = /^[A-Za-z\s]*$/;

  prueba() {

  }
  ngOnInit() {
    this.cargarArticulos();
    this.loadVencimientoArticle();
    this.facturaForm = new FormGroup({
      identificacion: new FormControl('', [Validators.required, Validators.minLength(5), Validators.pattern(this.validarNumero)]),
      nombre: new FormControl('', [Validators.required, Validators.minLength(5), Validators.pattern(this.validarLetras)]),
      apellido: new FormControl('', [Validators.required, Validators.minLength(5), Validators.pattern(this.validarLetras)]),
      telefono: new FormControl('', [Validators.required, Validators.minLength(5), Validators.pattern(this.validarNumero)]),
      direccion: new FormControl('', [Validators.required, Validators.minLength(5)]),
      subtotal: new FormControl('', []),
      descuentoF: new FormControl('0', [Validators.pattern(this.validarNumero)]),
      iva: new FormControl('0', []),
      totalPagar: new FormControl('0', []),
      restaPorCobrar: new FormControl('', []),
      abonoF: new FormControl('', [Validators.pattern(this.validarNumero)]),
      articulos: new FormControl(this.carrito, []),
      nroFactura: new FormControl('00000', [Validators.required, Validators.pattern(this.validarNumero)]),
      fecha: new FormControl('')

    });
    this.cargarFacturas();
  }

  calcularTotalDia() {

    this.totalVendido = 0;
    var fechaActual = new Date();
    var diaActual = fechaActual.getDate();
    var mesActual = fechaActual.getMonth();
    var annoActual = fechaActual.getFullYear();
    var fecha1: string;
    var fecha2: string;


    fecha1 = (diaActual + '/' + mesActual + '/' + annoActual);
    console.log(fecha1);

    var fechaFactura = new Date();
    var construirFecha = function (fecha) {
      fechaFactura.setTime(fecha);
      return (fechaFactura.getDate() + '/' + fechaFactura.getMonth() + '/' + fechaFactura.getFullYear());
    };

    this.facturaFilter.splice(0);
    for (var i = 0; i < this.facturas.length; i++) {
      fecha2 = construirFecha(this.facturas[i].fecha);
      if (fecha1 == fecha2) {
        this.facturaFilter.push(this.facturas[i]);
      }
    }

    for (var i = 0; i < this.facturaFilter.length; i++) {
      this.totalVendido += this.facturaFilter[i].totalPagar;
    }

    //calcular el total de ganacia del dia
    //------------------------------------
    var totalCosto: number = 0;
    this.gananciaDelDia = 0;
    var factura: Factura;
    for (var i = 0; i < this.facturaFilter.length; i++) {
      factura = this.facturaFilter[i];
      for (var _i = 0; _i < factura.articulos.length; _i++) {
        totalCosto += (factura.articulos[_i].cantidadCompra * factura.articulos[_i].precio);
        console.log('vuelta numero ' + _i);
        console.log(totalCosto);
      }
    }
    this.gananciaDelDia = this.totalVendido - totalCosto;
  }


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
      this.statusClienteDefault = false;
    }

    this.limpiarFormulario();
  }
  tipoVenta() {
    if (this.turnTipoVenta) {
      this.turnTipoVenta = false;
    } else {
      this.turnTipoVenta = true;
      this.porCobrar = this.totalPagar;
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
            } as Factura;
          }
        );
        console.log('se han cargado las facturas');
        this.calcularTotalDia();

      }
    );
  }

  loadVencimientoArticle() {
    this.facturacionService.loadArticuloVencimiento(this.auth.auth.currentUser.email).subscribe(
      resultado => {
        this.fechasVencimientoArticulo = resultado.map(
          items => {
            return {
              id: items.payload.doc.id,
              ...items.payload.doc.data()
            } as VencimientoArticulo
          }
        );
      }
    );
  }

  fechasVencimientoAsociadas(cod: string) {
    var count = 0;

    this.listVencimiento = this.fechasVencimientoArticulo.filter(
      function (val) {
        return val.codigo.toLowerCase().startsWith(cod.toLowerCase());
      }
    );

    if (this.listVencimiento != undefined || this.listVencimiento.length > 0) {
      for (var _i = 0; _i < this.listVencimiento.length; _i++) {
        var item = this.listVencimiento[_i];
        count += Number.parseInt(item.cantidad);
      }
    }
    this.contar = count;
    this.listVencimiento.sort((a, b) => {
      if (a.fecha.seconds > b.fecha.seconds) {
        return 1
      }
      if (a.fecha.seconds < b.fecha.seconds) {
        return -1
      }
      return 0;
    });
  }

  actualizarInventario() {
    var codigo: string;
    var cantidadSolicitada: number;
    var cantidadDisponible: number;
    cantidadDisponible = this.listVencimiento[0].cantidad;


    for (var i = 0; i < this.carrito.length; i++) {
      codigo = this.carrito[i].codigo;
      this.fechasVencimientoAsociadas(codigo);
      cantidadSolicitada = this.carrito[i].cantidadCompra;


      if (cantidadSolicitada <= cantidadDisponible) {
        this.listVencimiento[0].cantidad = cantidadDisponible - cantidadSolicitada;
        this.actualizarCantidadDisponible(this.listVencimiento[0]);


      }
      else {

        var cantidadRestante: number;
        for (var _i = 0; _i < this.listVencimiento.length; _i++) {

          cantidadDisponible = this.listVencimiento[_i].cantidad;

          if (cantidadSolicitada >= cantidadDisponible) {

            cantidadRestante = cantidadSolicitada - cantidadDisponible;

            this.listVencimiento[_i].cantidad = cantidadDisponible - cantidadDisponible;

            this.actualizarCantidadDisponible(this.listVencimiento[_i]);

            cantidadSolicitada = cantidadRestante;

          }
          else {
            this.listVencimiento[_i].cantidad = cantidadDisponible - cantidadSolicitada;
            this.actualizarCantidadDisponible(this.listVencimiento[_i]);

          }

        }

      }

    }
  }

  actualizarCantidadDisponible(formulario: any) {

    this.facturacionService.actualizarCantidad(formulario, this.auth.auth.currentUser.email).then(
      exito => {
        this.fechasVencimientoAsociadas(formulario.codigo);
      },
      fail => {
        Swal.fire('Error', 'No se ha podido modificar el Articulo', 'error');
        console.log(fail);

      }
    )

  }

  actualizarCantidadDisponibleArticulo(codigo: string, num: number) {
    this.facturacionService.actualizarCantidadArticulo(codigo, num, this.auth.auth.currentUser.email).then(
      exito => {
      },
      fail => {
        Swal.fire('Error', 'No se ha podido modificar la cantidad del Articulo', 'error');
        console.log(fail);

      }
    )
  }
  agregarAlCarrito(articulo: Articulo) {
    this.fechasVencimientoAsociadas(articulo.codigo);
    if (this.contar > 0) {
      var index = this.carrito.indexOf(articulo);
      if (index === -1) {
        articulo.cantidadCompra = 1;
        this.carrito.push(articulo);
      } else {
        if (this.contar > articulo.cantidadCompra) {
          this.carrito[index].cantidadCompra += 1;
        } else {
          alert('Articulo Agotado, cantidad maxima ' + this.contar.toString());
        }
      }
      this.realizarCalculos();
      this.porCobrar = this.totalPagar;

    } else {
      alert('Articulo Agotado, cantidad maxima ' + this.contar.toString());
    }
  }

  bajarDelCarrito(item: number) {
    delete this.carrito[item];
  }
  saveForm() {
    if (this.facturaForm.valid) {
      if (this.carrito.length > 0) {

        this.facturaForm.get('subtotal').setValue(this.subtotal);
        this.facturaForm.get('descuentoF').setValue(this.descuento);
        this.facturaForm.get('iva').setValue(this.iva);
        this.facturaForm.get('totalPagar').setValue(this.totalPagar);
        this.facturaForm.get('abonoF').setValue(this.abono);
        this.facturaForm.get('restaPorCobrar').setValue(this.porCobrar);
        this.facturaForm.get('fecha').setValue(Date.now());
        var tipo: number;

        if (!this.turnTipoVenta) {
          tipo = 1
        } else {
          tipo = 2;
        }

        this.facturacionService.registrarFactura(this.auth.auth.currentUser.email, this.facturaForm, tipo).then(
          exito => {
            this.actualizarInventario();
            Swal.fire('Exito', 'Se ha realizado la Venta', 'success');
            for (var i = 0; i < this.carrito.length; i++) {
              this.fechasVencimientoAsociadas(this.carrito[i].codigo);
              this.actualizarCantidadDisponibleArticulo(this.carrito[i].codigo, this.contar);
            }
            this.limpiarFormulario();
            this.calcularTotalDia();
          },
          error => {
            Swal.fire('Error', 'No se ha podido realizar la venta', 'error');
            console.log(error);
          }
        )

      }
      else {
        Swal.fire('Error', 'No has registrado ningun articulo', 'error');
      }
    } else {
      Swal.fire('Error', 'Verifica los campos del Formulario', 'error')
    }



  }
  realizarCalculos() {
    this.calcularTotalCompra();
    this.calcularSubtotal();
    this.calcularIva();
    this.calcularTotalPagar();
    this.calcularRestaPorPagar()
  }
  buscarCliente() {

  }
  calcularTotalCompra() {
    this.descuento = this.facturaForm.get('descuentoF').value;
    this.totalCompra = 0;
    //1. Que el carrito posea articulos
    //2. Que los datos del descuento sean numeros enteros positivos
    //3. Que el descuento sea menor que el total a pagar

    if (this.carrito.length > 0) {
      if (this.descuento >= 0) {
        for (let i = 0; i < this.carrito.length; i++) {
          this.totalCompra += this.carrito[i].cantidadCompra * this.carrito[i].precioVenta;
        }

        if (this.descuento < this.totalCompra) {
          this.totalCompra = this.totalCompra - this.descuento;
        } else {
          Swal.fire('Disculpe', 'el Descuento es mayor que el total de la compra, por favor ingrese un descuento menor', 'info');
          this.descuento = 0;
          this.facturaForm.get('descuentoF').setValue(0);

        }

      } else {
        Swal.fire('Disculpe', 'ha ingresado una letra o un valor no permitido', 'warning');
        this.descuento = 0;
        this.facturaForm.get('descuentoF').setValue(0);
      }


    } else {
      Swal.fire('Disculpe', 'Debe agregar los articulos primero', 'info');
      this.descuento = 0;
      this.facturaForm.get('descuentoF').setValue(0);
    }

  }
  calcularSubtotal() {
    if (this.totalCompra > 0) {
      this.subtotal = this.totalCompra - (this.totalCompra * this.ivaBase);
    }
  }
  calcularTotalPagar() {
    this.totalPagar = this.subtotal + this.iva;
  }
  calcularIva() {

    this.iva = 0;

    this.iva = this.totalCompra * this.ivaBase;
  }
  calcularRestaPorPagar() {
    this.abono = this.facturaForm.get('abonoF').value;
    if (this.turnTipoVenta) {
      if(this.carrito.length>0){
        if (this.totalPagar > 0 && this.abono < this.totalPagar) {
          this.porCobrar = this.totalPagar - this.abono;
        } 
        else
        {
          this.abono = 0;
          this.porCobrar = this.totalPagar - this.abono;
          Swal.fire('Aviso', 'El abono debe ser menor que el total a pagar', 'info');
          this.facturaForm.get('abonoF').setValue(0);
  
        }
      }else{
       Swal.fire('Disculpe','debe agregar los articulos primero');
       this.abono=0;
       this.facturaForm.get('abonoF').setValue(0);
      }
    }
  }
  singOut() {
    this.auth.auth.signOut();
    Swal.fire('Exito', 'Se ha cerrado la sesion', 'success');
  }
  limpiarFormulario() {
    this.facturaForm.reset();
    this.carrito.splice(0);
    this.descuento = 0;
    this.subtotal = 0;
    this.iva = 0;
    this.totalPagar = 0;
    this.abono = 0;
    this.porCobrar = 0;

    this.facturaForm.get('subtotal').setValue(0);
    this.facturaForm.get('descuentoF').setValue(0);
    this.facturaForm.get('iva').setValue(0);
    this.facturaForm.get('totalPagar').setValue(0);
    this.facturaForm.get('abonoF').setValue(0);
    this.facturaForm.get('restaPorCobrar').setValue(0);
    this.facturaForm.get('articulos').setValue(this.carrito);
    this.facturaForm.get('nroFactura').setValue('00000');
    if (this.statusClienteDefault) {
      this.facturaForm.get('identificacion').setValue('00000');
      this.facturaForm.get('nombre').setValue('Softw');
      this.facturaForm.get('apellido').setValue('Agile');
      this.facturaForm.get('direccion').setValue('default');
      this.facturaForm.get('telefono').setValue('00000000');
    }






  }
  limpiarCarrito() {
    this.carrito.splice(0);
    this.descuento = 0;
    this.subtotal = 0;
    this.iva = 0;
    this.totalPagar = 0;
    this.abono = 0;
    this.facturaForm.get('subtotal').setValue(0);
    this.facturaForm.get('descuentoF').setValue(0);
    this.facturaForm.get('iva').setValue(0);
    this.facturaForm.get('totalPagar').setValue(0);
    this.facturaForm.get('abonoF').setValue(0);
    this.facturaForm.get('restaPorCobrar').setValue(0);

  }
  //Metodos de la busqueda
  switchModeSearch() {
    if (!this.searchMode) {
      this.searchMode = true;
    } else {
      this.searchMode = false;
    }
  }
  searchArticle(word: string) {
    if (!this.searchMode) {
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
    } else {
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

  clienteDefault(e) {
    let estatus = e.target.checked;
    if (estatus) {

      this.facturaForm.get('identificacion').setValue('00000');
      this.facturaForm.get('nombre').setValue('Softw');
      this.facturaForm.get('apellido').setValue('Agile');
      this.facturaForm.get('direccion').setValue('default');
      this.facturaForm.get('telefono').setValue('00000000');
      this.statusClienteDefault = true;
    }
    else {

      this.facturaForm.get('identificacion').setValue('');
      this.facturaForm.get('nombre').setValue('');
      this.facturaForm.get('apellido').setValue('');
      this.facturaForm.get('direccion').setValue('');
      this.facturaForm.get('telefono').setValue('');
      this.statusClienteDefault = false;

    }


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
  get descuentoF() {
    return this.facturaForm.get('descuentoF');
  }

  get abonoF() {
    return this.facturaForm.get('abonoF')
  }

  get nroFactura() {
    return this.facturaForm.get('nroFactura');
  }

  get fecha() {
    return this.facturaForm.get('fecha');
  }

}
