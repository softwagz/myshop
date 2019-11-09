import { Component, OnInit } from '@angular/core';
import { InventarioService } from '../../Servicios/inventario.service';
import { ToastrService } from 'ngx-toastr';
import { AngularFireAuth } from '@angular/fire/auth';
import { NgForm } from '@angular/forms';
import { Articulo } from 'src/app/Modelos/articulo';
import * as $ from 'jquery';
import { VencimientoArticulo } from 'src/app/Modelos/vencimiento-articulo';

//pendiente por corregir, debemos modificar la agregacion de las fechas de vencimiento, el Id no puede repetirse
//y el Id debe coincidir con el codigo de barras del producto. para el momento de eliminarse pueda elimninarse las fechas asociadas


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
    precioVenta:0
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

  modificarGuardar: string = "Editar";
  cancelarCerrar = "Cerrar";
  statusEdit = false;

  prueba(algo?: any) {
  }
  ngOnInit() {
    this.loadArticle();
    this.loadVencimientoArticle();

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
    this.inventarioServ.registerArticle(this.auth.auth.currentUser.email, form).then(
      exito => {
        this.toas.success('Se ha Registrado el Articulo', 'Operacion Exitosa');
        //Registra la fecha de vencimiento
        this.inventarioServ.registerVencimientoArticle(this.auth.auth.currentUser.email, form).then(
          exito => {
            this.toas.success('Fechas Agregadas', 'Vencimiento');
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
  }
  agregarInventario(form: NgForm) {
    this.inventarioServ.registerVencimientoArticle(this.auth.auth.currentUser.email, form).then(
      exito => {
        let codigo = form.value.codigo;
        this.toas.success('Se han agregado los nuevos articulos al inventario', 'Registro Exitoso');
        this.fechasVencimientoAsociadas(codigo);
        this.articuloSelected.codigo = codigo;
      },
      error => {
        this.toas.warning('no se han podido agregar los nuevos articulos al inventario', 'Operacion Fallida');
        console.log(error);
      }
    )
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
      
      

  }

  contarTotal(number: number) {
    this.contar += number;
  }

  deleteArticle(id: string) {
    this.inventarioServ.deleteArticle(this.auth.auth.currentUser.email, id).then(
      resultado => {
        this.toas.info('Se ha Eliminado el Articulo', 'Eliminacion Exitosa');
      }
      ,
      error => {
        this.toas.error('No se ha podido Eliminar el articulo', 'Fallo al Eliminar');
        console.log(error);
      }
    );
    for(let i = 0; i< this.listVencimiento.length; i++){
      this.inventarioServ.deleteVencimientoArticle(this.auth.auth.currentUser.email,this.listVencimiento[i].id).then(
        success => {
          this.toas.success('Fechas Asociadas','Eliminacion');
        },
        fail => {
          this.toas.error('Fechas Asociadas','Error');
          console.log(fail);
        }
      )   
    }
  
    }
  deleteMultiArticle(){

  }
  deleteVencimientoArticle(id:string,cod:string){
    this.inventarioServ.deleteVencimientoArticle(this.auth.auth.currentUser.email,id).then(
      success => {
        this.toas.success('Fecha Asociada','Eliminacion');
        this.loadVencimientoArticle();
        this.fechasVencimientoAsociadas(cod);
      },
      fail => {
        this.toas.error('Fecha Asociada','Error');
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


    }
    else {
      this.modificarGuardar = "Modificar";
      this.cancelarCerrar = "Cerrar";
      this.statusEdit = false;
      $('#descripcion').attr('readonly', 'readonly');
      $('#presentacion').attr('readonly', 'readonly');
      $('#precio').attr('readonly', 'readonly');
      $('#precioVenta').attr('readonly','readonly');
      $('#descuento').attr('readonly', 'readonly');
      $('#stockMinimo').attr('readonly', 'readonly');
      $('#stockMaximo').attr('readonly', 'readonly');
      $('#saveModif').attr("data-dismiss", "modal");


      //llamando al metodo de actualizacion de los cambios
      this.inventarioServ.editArticle(form,this.auth.auth.currentUser.email).then(
        exito => {
            this.toas.show('se estan guardando los cambios', 'Modificando');
            console.log(exito);
            this.toas.success('Cambios guardados correctamente','Exito');
        },
        fail => {
          this.toas.warning ('No se ha podido modificar','Operacion Fallida');
          console.log(fail);

        }
      )

    }
  }
  cancelCerrar() {
    if (this.statusEdit) {
      this.modificarGuardar = "Editar";
      this.cancelarCerrar = "Cerrar";
      this.statusEdit = false;
      $('#descripcion').attr('readonly', 'readonly');
      $('#presentacion').attr('readonly', 'readonly');
      $('#precio').attr('readonly', 'readonly');
      $('#descuento').attr('readonly', 'readonly');
      $('#stockMinimo').attr('readonly', 'readonly');
      $('#stockMaximo').attr('readonly', 'readonly');
      $('#saveModif').removeAttr("data-dismiss");
      this.loadArticle();
      this.loadVencimientoArticle();

    }
    else {
      this.statusEdit = false;
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

  //Metodos de Apoyo
  clearForm(form: NgForm) {
    form.reset();
  }

  excentoIVA(e) {
    this.articuloSelected.iva = e.target.checked;
  }


}
