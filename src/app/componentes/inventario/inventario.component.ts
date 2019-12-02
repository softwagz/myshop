import { Component, OnInit } from '@angular/core';
import { InventarioService } from '../../Servicios/inventario.service';
import { ToastrService } from 'ngx-toastr';
import { AngularFireAuth } from '@angular/fire/auth';
import { NgForm } from '@angular/forms';
import { Articulo } from 'src/app/Modelos/articulo';
import * as $ from 'jquery';
import { VencimientoArticulo } from 'src/app/Modelos/vencimiento-articulo';
import Swal from 'sweetalert2';
import Popper from 'popper.js';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {

  constructor(private inventarioServ: InventarioService, private toas: ToastrService,
    private auth: AngularFireAuth) {

  }


  //Atributos para manejo de articulos
  dataArticulo: Articulo[];
  articulo: Articulo = new Articulo();
  fechasVencimientoArticulo: VencimientoArticulo[];
  vencimiento: VencimientoArticulo = new VencimientoArticulo();
  statusAgregar: boolean = false;
  contar: number;
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
  vencimientoSelected = {
    id: "",
    codigo: "",
    cantidad: 0,
    fecha: ""
  }
  listVencimiento = [];
  //Metodos de Busqueda
  searchState: boolean = false;
  resultState: boolean = false;
  searchData: Articulo[];
  search: string = "";

  /*Auxiliares de Botones */
  modificarGuardar: string = "Editar";
  cancelarCerrar = "Cerrar";
  statusEdit:boolean = false;
  mostrarFormulario:boolean=false;

  /* Validadores de Formulario */

  codigo: boolean = false;
  precioCompra: boolean = false;
  precioVenta: boolean = false;
  descuento: boolean = false;
  min: boolean = false;
  max: boolean = false;
  cantidad: boolean = false;
  formValido: boolean = false;

  codigoEdit: boolean = false;
  precioCompraEdit: boolean = false;
  precioVentaEdit: boolean = false;
  descuentoEdit: boolean = false;
  minEdit: boolean = false;
  maxEdit: boolean = false;
  formValidoEdit: boolean = false;

  cantidadAdd:boolean=false;
  formAddValid:boolean=false;



  prueba() {

    /*    Swal.fire({
      title: 'Error!',
      text: 'Do you want to continue',
      icon: 'error',
      confirmButtonText: 'Cool'
    })  */

  }

  mensajeError(elemento: string, mensaje: string) {
    $("#" + mensaje).show();
    var pop = new Popper(document.getElementById(elemento), document.getElementById(mensaje),
      {
        placement: "bottom",
        modifiers: {
          applyStyle: { enabled: true },
          applyReactStyle: {
            enabled: true,
            order: 900,
          },
        }
      }
    );

    setTimeout(() => {
      $("#" + mensaje).hide();
    }, 4000);
  }

  ngOnInit() {
    this.loadArticle();
    this.loadVencimientoArticle();
    $('#formRegister').hide();

  }
  singOut() {
    this.auth.auth.signOut();
    this.toas.show('Su sesion ha finalizado correctamente', 'Cerrando Session');
  }
  //Carga de Inicio
  loadArticle() {
    this.inventarioServ.loadArticle(this.auth.auth.currentUser.email).subscribe(
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
  loadVencimientoArticle() {
    this.inventarioServ.loadArticuloVencimiento(this.auth.auth.currentUser.email).subscribe(
      resultado => {
        this.fechasVencimientoArticulo = resultado.map(
          items => {
            return {
              id: items.payload.doc.id,
              ...items.payload.doc.data()
            } as VencimientoArticulo
          }
        );
        console.log('se ha cargado las fechas de vencimiento');
        console.log(this.fechasVencimientoArticulo);
      }
    );
  }
  //Manipulacion de Articulos
  registerArticle(form: NgForm) {
    if (form.valid) {
      if (this.formValido) {
        this.inventarioServ.registerArticle(this.auth.auth.currentUser.email, form).then(
          exito => {
            Swal.fire('Registro Exitoso', 'Se ha agregado el articulo a la lista', 'success');
            //Registra la fecha de vencimiento
            this.inventarioServ.registerVencimientoArticle(this.auth.auth.currentUser.email, form).then(
              exito => {
                this.clearForm(form);
              },
              error => {
                this.toas.warning('No se ha podido Registrar la fecha de Vencimiento', 'Fallo');
                console.log(error);
              }
            )

          },
          error => {
            this.toas.warning('No se ha podido Registrar', 'Fallo la Operacion');
            console.log(error);
          }
        )
      } else {
        Swal.fire('Error en el Formulario', 'Verifique la informacion suministrada', 'error');
      }

    }
    else {
      Swal.fire('Error en el Formulario', 'Verifique la informacion suministrada', 'error');

    }

  }
  agregarInventario(form: NgForm) {
    if(form.valid){
      if(this.formAddValid){
        this.inventarioServ.registerVencimientoArticle(this.auth.auth.currentUser.email, form).then(
          exito => {
            let codigo = form.value.codigo;
            Swal.fire('Exito','Se ha registrado los nuevos productos al inventario','success');
            this.fechasVencimientoAsociadas(codigo);
            this.articuloSelected.codigo = codigo;
          },
          error => {
            Swal.fire('Error','No se ha podido agregar los articulos al inventario','error');
            console.log(error);
          }
        )
      }else{
        Swal.fire('Error','Verifica los campos resaltados','error');
      }
    }else{
      Swal.fire('Error','Debes llenar los campos correctamente','error');
    }
  }
  viewArticle(article: any) {
    this.fechasVencimientoAsociadas(article.codigo);
    console.log(article);
    this.articuloSelected = article;
    //Estado por defecto del Modal View, evita errores al hacer click fuera del modal
    this.modificarGuardar = "Modificar";
    this.cancelarCerrar = "Cerrar";
    this.statusEdit = false;
    $('#descripcion').attr('readonly', 'readonly');
    $('#presentacion').attr('readonly', 'readonly');
    $('#precio').attr('readonly', 'readonly');
    $('#precioVenta').attr('readonly', 'readonly');
    $('#descuento').attr('readonly', 'readonly');
    $('#stockMinimo').attr('readonly', 'readonly');
    $('#stockMaximo').attr('readonly', 'readonly');
    $('#saveModif').attr("data-dismiss", "modal");
    $('#saveModif').attr("data-dismiss", "modal");
    $('#cancelar').attr("data-dismiss", "modal");
    $('#btnFechas').show();
    $('#btnDelete').show();
    this.codigoEdit = false;
    this.precioCompraEdit= false;
    this.precioVentaEdit = false;
    this.descuentoEdit = false;
    this.minEdit = false;
    this.maxEdit = false;
    this.formValidoEdit = false;



  }

  contarTotal(number: number) {
    this.contar += number;
  }

  deleteArticle(id: string) {
    if(confirm('El Articulo sera Eliminado al igual que el Registro de Inventario Asociado')){
      {
        this.inventarioServ.deleteArticle(this.auth.auth.currentUser.email, id).then(
          resultado => {
            Swal.fire('Exito','El Articulo se ha eliminado correctamente','success');
          }
          ,
          error => {
            this.toas.error('No se ha podido Eliminar el articulo', 'Fallo al Eliminar');
            console.log(error);
          }
        );
        for (let i = 0; i < this.listVencimiento.length; i++) {
          this.inventarioServ.deleteVencimientoArticle(this.auth.auth.currentUser.email, this.listVencimiento[i].id).then(
            success => {
              this.toas.info('Fechas Asociadas', 'Eliminacion');
            },
            fail => {
              this.toas.error('fallo al eliminar las Fechas Asociadas', 'Error');
              console.log(fail);
            }
          )
        }
    
      }
    }
  }
  deleteMultiArticle() {

  }
  deleteVencimientoArticle(id: string, cod: string) {
    this.inventarioServ.deleteVencimientoArticle(this.auth.auth.currentUser.email, id).then(
      success => {
        this.toas.success('Fecha Asociada', 'Eliminacion');
        this.loadVencimientoArticle();
        this.fechasVencimientoAsociadas(cod);
      },
      fail => {
        this.toas.error('Fecha Asociada', 'Error');
        console.log(fail);
      }
    )
  }

  clearSearch() {
    this.searchArticle("");

  }

  searchArticle(word: string) {
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
  }

  agregarArticulos() {
    this.statusAgregar = true;
  }

  cancelarAgregar() {
    this.statusAgregar = false;
  }
  modificarArticulo(form: NgForm) {
    if (!this.statusEdit) {
      this.modificarGuardar = "Guardar";
      this.cancelarCerrar = "Cancelar";
      this.statusEdit = true;
      $('#descripcion').removeAttr('readonly');
      $('#presentacion').removeAttr('readonly');
      $('#precio').removeAttr('readonly');
      $('#precioVenta').removeAttr('readonly');
      $('#descuento').removeAttr('readonly');
      $('#stockMinimo').removeAttr('readonly');
      $('#stockMaximo').removeAttr('readonly');
      $('#saveModif').removeAttr("data-dismiss");
      this.toas.info('Modifique los campos deseados', 'Modificar');
      $('#saveModif').removeAttr("data-dismiss");
/*       $('#cancelar').removeAttr("data-dismiss");
 */      $('#btnFechas').hide();
      $('#btnDelete').hide();




    }
    else {
      if(form.valid){
        if(this.formValidoEdit){
              this.modificarGuardar = "Modificar";
              this.cancelarCerrar = "Cerrar";
              this.statusEdit = false;
              $('#descripcion').attr('readonly', 'readonly');
              $('#presentacion').attr('readonly', 'readonly');
              $('#precio').attr('readonly', 'readonly');
              $('#precioVenta').attr('readonly', 'readonly');
              $('#descuento').attr('readonly', 'readonly');
              $('#stockMinimo').attr('readonly', 'readonly');
              $('#stockMaximo').attr('readonly', 'readonly');
              $('#saveModif').attr("data-dismiss", "modal");
              $('#cancelar').attr("data-dismiss", "modal");
              $('#btnFechas').show();
              $('#btnDelete').show();
        
              //llamando al metodo de actualizacion de los cambios
              this.inventarioServ.editArticle(form, this.auth.auth.currentUser.email).then(
                exito => {
                  Swal.fire('Exito','Se ha modificado el Articulo','success')
                },
                fail => {
                  Swal.fire('Error','No se ha podido modificar el Articulo','error');
                  console.log(fail);
        
                }
              )
        
            
          
        }else{
          Swal.fire('Error','has alterado algun campo de manera incorrecte, el campo aparecera con un mensaje debajo','error');
        }
      }else{

        Swal.fire('Error','Verifica los datos del formulario, puede que tengas un campo invalido','error');

      }
    }
  }
  cancelCerrar() {
    if (this.statusEdit) {
      this.modificarGuardar = "Modificar";
      this.cancelarCerrar = "Cerrar";
      this.statusEdit = false;
      $('#descripcion').attr('readonly', 'readonly');
      $('#presentacion').attr('readonly', 'readonly');
      $('#precio').attr('readonly', 'readonly');
      $('#descuento').attr('readonly', 'readonly');
      $('#stockMinimo').attr('readonly', 'readonly');
      $('#stockMaximo').attr('readonly', 'readonly');
      $('#saveModif').removeAttr("data-dismiss");
/*       $('#cancelar').removeAttr("data-dismiss");
 */      $('#btnFechas').show();
      $('#btnDelete').show();
      this.loadArticle();
      this.loadVencimientoArticle();
      this.codigoEdit = false;
      this.precioCompraEdit= false;
      this.precioVentaEdit = false;
      this.descuentoEdit = false;
      this.minEdit = false;
      this.maxEdit = false;
      this.formValidoEdit = false;


    }
    else {
      this.statusEdit = false;
      $('#cancelar').attr("data-dismiss", "modal");
      this.loadArticle();
      this.loadVencimientoArticle();

    }
  }


  //Filtro de Vencimientos
  fechasVencimientoAsociadas(cod: string) {
    var count: number = 0;

    this.listVencimiento = this.fechasVencimientoArticulo.filter(
      function (val) {
        return val.codigo.toLowerCase().startsWith(cod.toLowerCase());
      }
    );
    for (var _i = 0; _i < this.listVencimiento.length; _i++) {
      var item = this.listVencimiento[_i];
      count += Number.parseInt(item.cantidad);
    }
    this.contar = count;


  }

  fechasVencimientoCercanas(codigo: string) {

  }

  /* metodo de validacion del formulario */


  //Metodos de Apoyo

  clearForm(form: NgForm) {
    form.reset();
    this.codigo = false;
    this.precioCompra = false;
    this.precioVenta = false;
    this.descuento = false;
    this.min = false;
    this.max = false;
    this.cantidad = false;
    this.formValido = false;
  }

  excentoIVA(e) {
    this.articuloSelected.iva = e.target.checked;
  }

  validarForm(form: NgForm) {
    if (form.value.codigo != undefined) {
      if (this.validarNumero(form.value.codigo)) {
        this.codigo = false;
      } else {
        this.codigo = true;
      }
    }
    if (form.value.precio != undefined) {
      if (this.validarNumero(form.value.precio)) {
        this.precioCompra = false;
      } else {
        this.precioCompra = true;

      }
    }
    if (form.value.precioVenta != undefined) {
      if (this.validarNumero(form.value.precioVenta)) {
        this.precioVenta = false;
      } else {
        this.precioVenta = true;
      }
    }
    if (form.value.descuento != undefined) {
      if (this.validarNumero(form.value.descuento)) {
        this.descuento = false;
      }
      else {
        this.descuento = true;

      }
    }
    if (form.value.stockMinimo != undefined) {
      if (this.validarNumero(form.value.stockMinimo)) {
        this.min = false;
      }
      else {
        this.min = true;

      }
    }
    if (form.value.stockMaximo != undefined) {
      if (this.validarNumero(form.value.stockMaximo)) {
        this.max = false;
      } else {
        this.max = true;
      }
    }
    if (form.value.cantidad != undefined) {
      if (this.validarNumero(form.value.cantidad)) {
        this.cantidad = false;
      }
      else {
        this.cantidad = true;
      }
    }

    if (!this.codigo && !this.precioCompra && !this.precioVenta && !this.min && !this.max && !this.descuento && !this.cantidad) {
      this.formValido = true;
    } else {
      this.formValido = false;
    }
  }

  validarFormEdit(form: NgForm) {
    if (form.value.codigo != undefined) {
      if (this.validarNumero(form.value.codigo)) {
        this.codigoEdit = false;
      } else {
        this.codigoEdit = true;
      }
    }
    if (form.value.precio != undefined) {
      if (this.validarNumero(form.value.precio)) {
        this.precioCompraEdit = false;
      } else {
        this.precioCompraEdit = true;

      }
    }
    if (form.value.precioVenta != undefined) {
      if (this.validarNumero(form.value.precioVenta)) {
        this.precioVentaEdit = false;
      } else {
        this.precioVentaEdit = true;
      }
    }
    if (form.value.descuento != undefined) {
      if (this.validarNumero(form.value.descuento)) {
        this.descuentoEdit = false;
      }
      else {
        this.descuentoEdit = true;

      }
    }
    if (form.value.stockMinimo != undefined) {
      if (this.validarNumero(form.value.stockMinimo)) {
        this.minEdit = false;
      }
      else {
        this.minEdit = true;

      }
    }
    if (form.value.stockMaximo != undefined) {
      if (this.validarNumero(form.value.stockMaximo)) {
        this.maxEdit = false;
      } else {
        this.maxEdit = true;
      }
    }
    if (!this.codigoEdit && !this.precioCompraEdit && !this.precioVentaEdit && !this.minEdit && !this.maxEdit && !this.descuentoEdit) {
      this.formValidoEdit = true;
    } else {
      this.formValidoEdit = false;
    }
  }
  validarFormAdd(form:NgForm){
    if(form.value.cantidad!=undefined){
      if(this.validarNumero(form.value.cantidad)){
        this.cantidadAdd=false;
      }else{
        this.cantidadAdd=true;
      }
  }
  if(!this.cantidadAdd){
    this.formAddValid=true;
  }else{
    this.formAddValid=false;
  }
}


  validarNumero(valor: string) {
    if (!/^([0-9])*$/.test(valor)) {
      return false;
    } else {
      return true;
    }

  }
  validarString(valor: string) {
    if (!/^([a-z])*$/.test(valor.toLowerCase())) {
      return false;
    }
    else {
      return true;
    }


  }
  swichAgregar() {
    if (!this.mostrarFormulario) {
      $('#formRegister').show();
      $('#contenedorIcon').hide();
      this.mostrarFormulario=true;
      $('#tableArticulos').removeClass('col-md-10');

    }
    else {
      $('#formRegister').hide();
      $('#contenedorIcon').show();
      this.mostrarFormulario=false;
      $('#tableArticulos').addClass('col-md-10');

    }
  }




}
