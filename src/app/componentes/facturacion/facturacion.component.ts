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
  facturas:any[];
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

  validarNumero: any = /^\d*$/;
  validarLetras: any = /^([a-zA-z])*$/;


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
      articulos:new FormControl(this.carrito,[])

    });
    this.cargarFacturas();
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
    }

    this.limpiarFormulario();
  }
  tipoVenta() {
    if (this.turnTipoVenta) {
      this.turnTipoVenta = false;
    } else {
      this.turnTipoVenta = true;
      this.porCobrar = this.totalPagar;
      this.abono = 0;
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
            }
          }
        );
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
          alert('No hay esa cantidad Disponible');
        }
      }
      this.realizarCalculos();
      this.porCobrar = this.totalPagar;

    } else {
      alert('No hay esa cantidad Disponible');
    }
  }

  bajarDelCarrito(item: number) {
    delete this.carrito[item];
  }
  realizarCalculos() {
    this.calcularTotalCompra();
    this.calcularSubtotal();
    this.calcularIva();
    this.calcularTotalPagar();
    console.log(this.descuento);
  }


  buscarCliente() {

  }

  calcularTotalCompra() {
    this.descuento = this.facturaForm.get('descuentoF').value;
    this.totalCompra = 0;
    if (this.descuento != undefined && this.descuento >= 0) {
      for (let i = 0; i < this.carrito.length; i++) {
        this.totalCompra += this.carrito[i].cantidadCompra * this.carrito[i].precioVenta;
      }

      if (this.descuento >= 0 && this.descuento < this.totalCompra) {
        this.totalCompra = this.totalCompra - this.descuento;
      } else {
        Swal.fire('Error', 'el Descuento es mayor que el subtotal, no se tomara en cuenta', 'info');
        this.descuento = 0;
        this.facturaForm.get('descuentoF').setValue(0);
      }

    } else {
      this.descuento = 0;
      this.facturaForm.get('descuentoF').setValue(0);


    }

    console.log(this.totalCompra);
  }

  calcularSubtotal() {
    if (this.totalCompra > 0) {
      this.subtotal = this.totalCompra - (this.totalCompra * 0.12);
    }
  }

  calcularTotalPagar() {
    this.totalPagar = this.subtotal + this.iva;
  }

  calcularIva() {

    this.iva = 0;

    this.iva = this.totalCompra * 0.12;
  }





  calcularRestaPorPagar() {
    this.abono = this.facturaForm.get('abonoF').value;
    if (this.turnTipoVenta) {
      if (this.totalPagar > 0 && this.abono < this.totalPagar) {
        this.porCobrar = this.totalPagar - this.abono;

      } else {
        this.abono = 0;
        this.porCobrar = this.totalPagar - this.abono;
        Swal.fire('Aviso', 'El abono debe ser menor que el total a pagar', 'info');
        this.facturaForm.get('abonoF').setValue(0);

      }
    }
  }

  singOut() {
    this.auth.auth.signOut();
    this.toas.show('Su sesion ha finalizado correctamente', 'Cerrando Session');
  }

  saveForm() {
    if (this.facturaForm.valid) {
      
    this.facturaForm.get('subtotal').setValue(this.subtotal);
    this.facturaForm.get('descuentoF').setValue(this.descuento);
    this.facturaForm.get('iva').setValue(this.iva);
    this.facturaForm.get('totalPagar').setValue(this.totalPagar);
    this.facturaForm.get('abonoF').setValue(this.abono);
    this.facturaForm.get('restaPorCobrar').setValue(this.porCobrar);

      this.facturacionService.registrarFactura(this.auth.auth.currentUser.email, this.facturaForm, this.carrito, 1).then(
        exito => {
          Swal.fire('Exito', 'Se ha realizado la Venta', 'success');
          this.limpiarFormulario();
          console.log(this.facturas);
        },
        error => {
          Swal.fire('Error', 'No se ha podido realizar la venta', 'error');
          console.log(error);
        }
      )

    } else {
      Swal.fire('Error', 'Verifica los campos del Formulario', 'error')
      console.log(this.facturaForm);
    }
  }
  limpiarFormulario() {
    this.facturaForm.reset();
    this.carrito.splice(0);
    this.descuento = 0;
    this.subtotal = 0;
    this.iva = 0;
    this.totalPagar = 0;
    this.abono = 0;
    this.porCobrar=0;

    this.facturaForm.get('subtotal').setValue(0);
    this.facturaForm.get('descuentoF').setValue(0);
    this.facturaForm.get('iva').setValue(0);
    this.facturaForm.get('totalPagar').setValue(0);
    this.facturaForm.get('abonoF').setValue(0);
    this.facturaForm.get('restaPorCobrar').setValue(0);





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

}
