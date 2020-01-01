import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AngularFireAuth } from '@angular/fire/auth';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import { Factura } from '../../Modelos/factura';
import { VentasService } from '../../Servicios/ventas.service';
import Swal from 'sweetalert2';
import * as $ from 'jquery';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class VentasComponent implements OnInit {
  //variables
  facturasContado: Factura[] = [];
  facturasCredito: Factura[] = [];
  facturaSelected: Factura = new Factura;
  tipoFacturas: boolean = false;
  turnTipoBusqueda: string = "0";
  totalVendido: number = 0;
  facturaFilter: Factura[] = [];
  facturaFilterCredito: Factura[] = [];
  facturaConsulta: Factura[] = [];
  gananciaDelDia: number = 0;
  fecha1: string = "";
  fecha2: string = "";
  statusFilter: boolean = false;
  statusMostrarBusqueda = false;
  formAbono: FormGroup;
  totalVendidoBusqueda: number = 0;
  totalGananciaBusqueda: number = 0;
  totalRestaPorCobrar: number = 0;
  totalRestaPorCobrarBusqueda: number = 0;
  totalVendidoCredito: number = 0;
  totalGananciaCredito: number = 0;
  graficaStatus: boolean = false;
  montosTrimestre: ChartDataSets[] = [{ data: [0, 0, 0], label: 'Ventas del Trimestre Actual' }];
  montosSemestre:  ChartDataSets[] = [{ data: [0, 0, 0,0,0,0], label: 'Ventas del Semestre Actual'}];
  montosAnual: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  label:Label[] = [];
  meses = ['Enero', 'Febrero', 'Marzon', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  constructor(private toas: ToastrService, private auth: AngularFireAuth, private ventaService: VentasService) {


  }

  ngOnInit() {
    this.cargarFacturasContado();
    this.cargarFacturasCredito();
    $('#facturaContent').hide();
    this.formAbono = new FormGroup({
      abono: new FormControl('', [Validators.required])
    });
  }
  mostrarGraficas() {
    if (!this.graficaStatus) {
      this.graficaStatus = true;
    } else {
      this.graficaStatus = false;
    }
  }
  calcularTotalDia() {

    this.totalVendido = 0;
    var fechaActual = new Date();
    var diaActual = fechaActual.getDate();
    var mesActual = fechaActual.getMonth() + 1;
    var annoActual = fechaActual.getFullYear();
    var fecha1: string;
    var fecha2: string;


    fecha1 = (diaActual + '/' + mesActual + '/' + annoActual);
    console.log(fecha1);

    var fechaFactura = new Date();
    var construirFecha = function (fecha) {
      fechaFactura.setTime(fecha);
      return (fechaFactura.getDate() + '/' + (fechaFactura.getMonth() + 1) + '/' + fechaFactura.getFullYear());
    };

    this.facturaFilter.splice(0);
    for (var i = 0; i < this.facturasContado.length; i++) {
      fecha2 = construirFecha(this.facturasContado[i].fecha);
      if (fecha1 == fecha2) {
        this.facturaFilter.push(this.facturasContado[i]);
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
      }
    }
    this.gananciaDelDia = this.totalVendido - totalCosto;
    console.log(this.totalVendido);

  }
  calcularTotalDiaCredito() {

    this.totalVendidoCredito = 0;
    var fechaActual = new Date();
    var diaActual = fechaActual.getDate();
    var mesActual = fechaActual.getMonth() + 1;
    var annoActual = fechaActual.getFullYear();
    var fecha1: string;
    var fecha2: string;


    fecha1 = (diaActual + '/' + mesActual + '/' + annoActual);
    console.log(fecha1);

    var fechaFactura = new Date();
    var construirFecha = function (fecha) {
      fechaFactura.setTime(fecha);
      return (fechaFactura.getDate() + '/' + (fechaFactura.getMonth() + 1) + '/' + fechaFactura.getFullYear());
    };

    this.facturaFilterCredito.splice(0);
    for (var i = 0; i < this.facturasCredito.length; i++) {
      fecha2 = construirFecha(this.facturasCredito[i].fecha);
      if (fecha1 == fecha2) {
        this.facturaFilterCredito.push(this.facturasCredito[i]);

      }
    }

    for (var i = 0; i < this.facturaFilterCredito.length; i++) {
      this.totalVendidoCredito += this.facturaFilterCredito[i].totalPagar;
    }

    //calcular el total de ganacia del dia
    //------------------------------------
    var totalCosto: number = 0;
    this.totalGananciaCredito = 0;
    this.totalRestaPorCobrar = 0;
    var factura: Factura;
    for (var i = 0; i < this.facturaFilterCredito.length; i++) {
      factura = this.facturaFilterCredito[i];
      for (var _i = 0; _i < factura.articulos.length; _i++) {
        totalCosto += (factura.articulos[_i].cantidadCompra * factura.articulos[_i].precio);
      }
      this.totalRestaPorCobrar += this.facturaFilterCredito[i].restaPorCobrar;
    }
    this.totalGananciaCredito = this.totalVendidoCredito - totalCosto;

  }

  tipoBusqueda(e: any) {
    this.turnTipoBusqueda = e.target.value;
    this.facturaFilter.splice(0);
    this.statusFilter = false;
    this.fecha1 = "";
    this.fecha2 = "";
  }

  turnFactura() {
    if (this.tipoFacturas) {
      this.tipoFacturas = false;
    }
    else {
      this.tipoFacturas = true;

    }
    this.facturaFilter.splice(0);
    this.statusFilter = false;

  }
  mostrarBuscador() {
    if (this.statusMostrarBusqueda) {
      this.statusMostrarBusqueda = false;
      this.turnTipoBusqueda = "0;"
    } else {
      this.statusMostrarBusqueda = true;
    }
  }
  singOut() {
    this.auth.auth.signOut();
    this.toas.show('Su sesion ha finalizado correctamente', 'Cerrando Session');
  }

  cargarFacturasContado() {

    this.ventaService.cargarFacturasContado(this.auth.auth.currentUser.email).subscribe(
      resultado => {
        this.facturasContado = resultado.map(
          items => {
            return {
              id: items.payload.doc.id,
              ...items.payload.doc.data()
            } as Factura;
          }
        );
        console.log('se han cargado las facturas');
        this.facturasContado.sort((a, b) => {
          if (a.fecha > b.fecha) {
            return -1
          }
          if (a.fecha < b.fecha) {
            return 1
          }
          return 0;
        });
        this.calcularTotalDia();

      }
    );

  }

  cargarFacturasCredito() {

    this.ventaService.cargarFacturasCredito(this.auth.auth.currentUser.email).subscribe(
      resultado => {
        this.facturasCredito = resultado.map(
          items => {
            return {
              id: items.payload.doc.id,
              ...items.payload.doc.data()
            } as Factura;
          }
        );
        console.log('se han cargado las facturas');


        this.facturasCredito.sort((a, b) => {
          if (a.fecha > b.fecha) {
            return -1
          }
          if (a.fecha < b.fecha) {
            return 1
          }
          return 0;
        });
        this.calcularTotalDiaCredito();
      }
    );
  }
  busquedaFactura() {
    switch (this.turnTipoBusqueda) {
      case "1":
        this.filtrarIntervalo(this.fecha1, this.fecha2);
        break;
      case "2":
        this.filtrarFechaEspecifica(this.fecha1);
        break;

      default:
        break;
    }
  }

  filtrarIntervalo(a: any, b: any) {

    var fechaInicio: Date = new Date();
    fechaInicio.setTime(Date.parse(a));
    fechaInicio.setHours(24, 0, 0);

    var fechaFinal: Date = new Date();
    fechaFinal.setTime(Date.parse(b));
    fechaFinal.setHours(47, 59, 59);

    var fechaFactura: any;
    this.facturaFilter.splice(0);
    this.facturaFilterCredito.splice(0);
    if (!this.tipoFacturas) {
      if (this.fecha1 != "" && this.fecha2 != "") {

        for (var _i = 0; _i < this.facturasContado.length; _i++) {
          fechaFactura = this.facturasContado[_i].fecha;
          if (fechaInicio.getTime() <= fechaFactura && fechaFactura <= fechaFinal.getTime()) {
            this.facturaFilter.push(this.facturasContado[_i]);
            this.statusFilter = true;
            this.calcularTotalVendidoBusquedaContado();
            this.calcularTotalGananciaBusquedaContado();
          }
        }

        if (this.facturaFilter.length == 0) {
          Swal.fire('Resultado', 'No se han encontrado coincidencias', 'info');
        }

      } else {
        Swal.fire('Disculpe', 'debe ingresar un intervalo valido', 'info');
      }
    } else {
      if (this.fecha1 != "" && this.fecha2 != "") {
        for (var _i = 0; _i < this.facturasCredito.length; _i++) {
          fechaFactura = this.facturasCredito[_i].fecha;
          if (fechaInicio.getTime() <= fechaFactura && fechaFactura <= fechaFinal.getTime()) {
            this.facturaFilterCredito.push(this.facturasCredito[_i]);
            this.statusFilter = true;
            this.calcularTotalVendidoBusquedaCredito();
            this.calcularTotalGananciaBusquedaCredito();
          }
        }

        if (this.facturaFilterCredito.length == 0) {
          Swal.fire('Resultado', 'No se han encontrado coincidencias', 'info');
        }

      } else {
        Swal.fire('Disculpe', 'debe ingresar un intervalo valido', 'info');
      }

    }
  }
  filtrarFechaEspecifica(a: any) {
    var fechaInicio: Date = new Date();
    fechaInicio.setTime(Date.parse(a));
    fechaInicio.setHours(24, 0, 0);

    var fechaFinal: Date = new Date();
    fechaFinal.setTime(Date.parse(a));
    fechaFinal.setHours(47, 59, 59);

    var fechaFactura: any;
    this.facturaFilter.splice(0);
    this.facturaFilterCredito.splice(0);
    if (!this.tipoFacturas) {
      if (this.fecha1 != "") {

        for (var _i = 0; _i < this.facturasContado.length; _i++) {
          fechaFactura = this.facturasContado[_i].fecha;
          if (fechaInicio.getTime() <= fechaFactura && fechaFactura <= fechaFinal.getTime()) {
            this.facturaFilter.push(this.facturasContado[_i]);
            this.statusFilter = true;
            this.calcularTotalVendidoBusquedaContado();
            this.calcularTotalGananciaBusquedaContado();
          }
        }

        if (this.facturaFilter.length == 0) {
          Swal.fire('Resultado', 'No se han encontrado coincidencias', 'info');
        }

      } else {
        Swal.fire('Disculpe', 'Por favor ingrese una fecha valida', 'info');
      }
    } else {
      if (this.fecha1 != "") {

        for (var _i = 0; _i < this.facturasCredito.length; _i++) {
          fechaFactura = this.facturasCredito[_i].fecha;
          if (fechaInicio.getTime() <= fechaFactura && fechaFactura <= fechaFinal.getTime()) {
            this.facturaFilterCredito.push(this.facturasCredito[_i]);
            this.statusFilter = true;
            this.calcularTotalVendidoBusquedaCredito();
            this.calcularTotalGananciaBusquedaCredito();
          }
        }

        if (this.facturaFilterCredito.length == 0) {
          Swal.fire('Resultado', 'No se han encontrado coincidencias', 'info');
        }

      } else {
        Swal.fire('Disculpe', 'debe ingresar un intervalo valido', 'info');
      }

    }


  }

  calcularTotalVendidoBusquedaContado() {
    this.totalVendidoBusqueda = 0;
    for (var i = 0; i < this.facturaFilter.length; i++) {
      this.totalVendidoBusqueda += this.facturaFilter[i].totalPagar;
    }
  }

  calcularTotalGananciaBusquedaContado() {
    this.totalGananciaBusqueda = 0;
    var costoTotal: number = 0;
    for (var i = 0; i < this.facturaFilter.length; i++) {
      for (var _i = 0; _i < this.facturaFilter[i].articulos.length; _i++) {
        costoTotal += (this.facturaFilter[i].articulos[_i].cantidadCompra * this.facturaFilter[i].articulos[_i].precio);
      }
    }
    this.totalGananciaBusqueda = this.totalVendidoBusqueda - costoTotal;
  }

  calcularTotalVendidoBusquedaCredito() {
    this.totalVendidoBusqueda = 0;
    for (var i = 0; i < this.facturaFilterCredito.length; i++) {
      this.totalVendidoBusqueda += this.facturaFilterCredito[i].totalPagar;
    }
  }

  calcularTotalGananciaBusquedaCredito() {
    this.totalGananciaBusqueda = 0;
    var costoTotal: number = 0;
    this.totalRestaPorCobrarBusqueda = 0;

    for (var i = 0; i < this.facturaFilterCredito.length; i++) {
      for (var _i = 0; _i < this.facturaFilterCredito[i].articulos.length; _i++) {
        costoTotal += (this.facturaFilterCredito[i].articulos[_i].cantidadCompra * this.facturaFilterCredito[i].articulos[_i].precio);
      }
      this.totalRestaPorCobrarBusqueda += this.facturaFilterCredito[i].restaPorCobrar;

    }
    this.totalGananciaBusqueda = this.totalVendidoBusqueda - costoTotal;
  }

  actualizarRestaPorCobrar() {
    var abono = Number.parseInt(this.formAbono.get('abono').value);
    var restaPorCobrar: number = 0;
    if (!this.formAbono.valid || abono > this.facturaSelected.restaPorCobrar || abono == 0 || abono == undefined || abono == NaN) {
      Swal.fire('Disculpe', 'Verifique el monto ingresado', 'info');
    } else {
      restaPorCobrar = this.facturaSelected.restaPorCobrar - abono;
      this.ventaService.actualizarRestaPorCobrar(this.auth.auth.currentUser.email, this.facturaSelected.id, restaPorCobrar).then(
        resultado => {
          Swal.fire('Exito', 'Se ha abonado a la cuenta por cobrar');
        }, error => {
          console.log(error);
        }
      );
      this.facturaSelected.restaPorCobrar = restaPorCobrar;
      this.formAbono.reset();
      this.calcularTotalDiaCredito();
      this.calcularTotalVendidoBusquedaCredito();
      this.calcularTotalGananciaBusquedaCredito();

    }
  }


  viewFactura(factura: any) {
    $('#facturaContent').fadeOut('fast');
    $('#facturaContent').fadeIn();
    this.facturaSelected = factura;
  }

  construirGraficas(type?: number) {
    switch (type) {
      case 1:

        break;
      case 2:

        break;
      case 3:

        break;

      default:

        break;
    }
  }



  graficaTrimestral() {
    var fechaActual: Date = new Date();
    var annoActual = fechaActual.getFullYear();
    var mes1 = fechaActual.getMonth() - 2;
    var mes2 = fechaActual.getMonth() - 1;
    var mes3 = fechaActual.getMonth();
    var acumuladorMes1: number = 0;
    var acumuladorMes2: number = 0;
    var acumuladorMes3: number = 0;
    this.label.splice(0);


    //Metodos para manipulacion de la fecha en la factura

    var construirFecha = function (fecha: any) {
      let fechaBase: any = fecha;
      var fechaFactura: Date = new Date();
      fechaFactura.setTime(fechaBase);
      return fechaFactura;
    }
    for (var _i = 0; _i < this.facturasContado.length; _i++) {
      if (construirFecha(this.facturasContado[_i].fecha).getMonth() == mes3 && construirFecha(this.facturasContado[_i].fecha).getFullYear() == annoActual) {
        acumuladorMes3 += this.facturasContado[_i].totalPagar;
        this.montosTrimestre[0].data[2] = acumuladorMes3;
        this.label[2] = this.meses[construirFecha(this.facturasContado[_i].fecha).getMonth()];
      }
      if (construirFecha(this.facturasContado[_i].fecha).getMonth() == mes2 && construirFecha(this.facturasContado[_i].fecha).getFullYear() == annoActual) {
        acumuladorMes2 += this.facturasContado[_i].totalPagar;
        this.montosTrimestre[0].data[1] = acumuladorMes2;
        this.label[1] = this.meses[construirFecha(this.facturasContado[_i].fecha).getMonth()];

      }
     
      if (construirFecha(this.facturasContado[_i].fecha).getMonth() == mes1 && construirFecha(this.facturasContado[_i].fecha).getFullYear() == annoActual) {
        acumuladorMes1 += this.facturasContado[_i].totalPagar;
        this.montosTrimestre[0].data[0] = acumuladorMes1;
        this.label[0] = this.meses[construirFecha(this.facturasContado[_i].fecha).getMonth()];

      }
    }
    for(var i = 0; i < this.label.length;i++){
      if(this.label[i]==undefined){
        this.label[i]="Sin Ventas para el año actual";
      }
    }

    this.lineChartData = this.montosTrimestre;
  }

  graficaAnual() {

  }
  graficaSemestral() {
    
    var fechaActual: Date = new Date();
    var annoActual = fechaActual.getFullYear();
    var mes1 = fechaActual.getMonth() - 5;
    var mes2 = fechaActual.getMonth() - 4;
    var mes3 = fechaActual.getMonth() - 3;
    var mes4 = fechaActual.getMonth() - 2;
    var mes5 = fechaActual.getMonth() - 1;
    var mes6 = fechaActual.getMonth();
    var acumuladorMes1: number = 0;
    var acumuladorMes2: number = 0;
    var acumuladorMes3: number = 0;
    var acumuladorMes4: number = 0;
    var acumuladorMes5: number = 0;
    var acumuladorMes6: number = 0;

    this.label.splice(0);


    //Metodos para manipulacion de la fecha en la factura

    var construirFecha = function (fecha: any) {
      let fechaBase: any = fecha;
      var fechaFactura: Date = new Date();
      fechaFactura.setTime(fechaBase);
      return fechaFactura;
    }
    for (var _i = 0; _i < this.facturasContado.length; _i++) {
      if (construirFecha(this.facturasContado[_i].fecha).getMonth() == mes6 && construirFecha(this.facturasContado[_i].fecha).getFullYear() == annoActual) {
        acumuladorMes6 += this.facturasContado[_i].totalPagar;
        this.montosSemestre[0].data[5] = acumuladorMes6;
        this.label[5] = this.meses[construirFecha(this.facturasContado[_i].fecha).getMonth()];
      }
      if (construirFecha(this.facturasContado[_i].fecha).getMonth() == mes5 && construirFecha(this.facturasContado[_i].fecha).getFullYear() == annoActual) {
        acumuladorMes5 += this.facturasContado[_i].totalPagar;
        this.montosSemestre[0].data[4] = acumuladorMes5;
        this.label[4] = this.meses[construirFecha(this.facturasContado[_i].fecha).getMonth()];
      }
      if (construirFecha(this.facturasContado[_i].fecha).getMonth() == mes4 && construirFecha(this.facturasContado[_i].fecha).getFullYear() == annoActual) {
        acumuladorMes4 += this.facturasContado[_i].totalPagar;
        this.montosSemestre[0].data[3] = acumuladorMes4;
        this.label[3] = this.meses[construirFecha(this.facturasContado[_i].fecha).getMonth()];
      }

      if (construirFecha(this.facturasContado[_i].fecha).getMonth() == mes3 && construirFecha(this.facturasContado[_i].fecha).getFullYear() == annoActual) {
        acumuladorMes3 += this.facturasContado[_i].totalPagar;
        this.montosSemestre[0].data[2] = acumuladorMes3;
        this.label[2] = this.meses[construirFecha(this.facturasContado[_i].fecha).getMonth()];
      }
      if (construirFecha(this.facturasContado[_i].fecha).getMonth() == mes2 && construirFecha(this.facturasContado[_i].fecha).getFullYear() == annoActual) {
        acumuladorMes2 += this.facturasContado[_i].totalPagar;
        this.montosSemestre[0].data[1] = acumuladorMes2;
        this.label[1] = this.meses[construirFecha(this.facturasContado[_i].fecha).getMonth()];

      }
      if (construirFecha(this.facturasContado[_i].fecha).getMonth() == mes1 && construirFecha(this.facturasContado[_i].fecha).getFullYear() == annoActual) {
        acumuladorMes1 += this.facturasContado[_i].totalPagar;
        this.montosSemestre[0].data[0] = acumuladorMes1;
        this.label[0] = this.meses[construirFecha(this.facturasContado[_i].fecha).getMonth()];

      }
    }

    for(var i = 0; i < this.label.length;i++){
      if(this.label[i]==undefined){
        this.label[i]="Sin Ventas para el año actual";
      }
    }

    this.lineChartData = this.montosSemestre;

  }

  //Metodos de las graficas

  public lineChartData: ChartDataSets[]=[
    { data: [], label: 'Seleccione una Venta para Mostrar' }];
  /* 
  public lineChartData: ChartDataSets[] = [
    { data: [220300, 240000, 270000, 280340], label: 'Ventas de Octubre' },
    { data: [243000, 230670, 250340, 270900], label: 'Ventas de Noviembre' },
    { data: [236000, 235000], label: 'Ventas de Diciembre' }
  ];
 */

  public lineChartLabels: Label[] = this.label;
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      xAxes: [{}],
      yAxes: [
        {
          id: 'y-axis-0',
          position: 'left',
        },
        {
          id: 'y-axis-1',
          position: 'right',
          gridLines: {
            color: 'rgba(255,0,0,0.3)',
          },
          ticks: {
            fontColor: 'red',
          }
        }
      ]
    },
    annotation: {
      annotations: [
        {
          type: 'line',
          mode: 'vertical',
          scaleID: 'x-axis-0',
          value: 'March',
          borderColor: 'orange',
          borderWidth: 2,
          label: {
            enabled: true,
            fontColor: 'orange',
            content: 'LineAnno'
          }
        },
      ],
    },
  };

  public lineChartColors: Color[] = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // red
      backgroundColor: 'rgba(255,0,0,0.3)',
      borderColor: 'red',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';
  public lineChartPlugins = [pluginAnnotations];
  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;

  public randomize(): void {
    for (let i = 0; i < this.lineChartData.length; i++) {
      for (let j = 0; j < this.lineChartData[i].data.length; j++) {
        this.lineChartData[i].data[j] = this.generateNumber(i);
      }
    }
    this.chart.update();
  }

  private generateNumber(i: number) {
    return Math.floor((Math.random() * (i < 2 ? 100 : 1000)) + 1);
  }

  // events
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
    console.log('clicked');
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public hideOne() {
    const isHidden = this.chart.isDatasetHidden(1);
    this.chart.hideDataset(1, !isHidden);
  }

  public pushOne() {
    this.lineChartData.forEach((x, i) => {
      const num = this.generateNumber(i);
      const data: number[] = x.data as number[];
      data.push(num);
    });
    this.lineChartLabels.push(`Label ${this.lineChartLabels.length}`);
  }

  public changeColor() {
    this.lineChartColors[2].borderColor = 'green';
    this.lineChartColors[2].backgroundColor = `rgba(0, 255, 0, 0.3)`;
  }

  public changeLabel() {
    this.lineChartLabels[2] = ['1st Line', '2nd Line'];
    // this.chart.update();
  }

  get abono() {
    return this.formAbono.get('abono');
  }

}
