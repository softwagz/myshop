import { Component, OnInit } from '@angular/core';
import { ClientesService } from '../../Servicios/clientes.service';
import { Cliente } from '../../Modelos/cliente';
import { AngularFireAuth } from '@angular/fire/auth';
import { NgForm, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as $ from 'jquery';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})

export class ClientesComponent implements OnInit {
  dataClientes: Cliente[];
  cliente: Cliente = new Cliente();
  clienteSelected: any = {
    id: "",
    data: {
      identificacion: "",
      nombre: "",
      apellido: "",
      telefono: "",
      direccion: ""

    }
  }
  search: string;
  searched: boolean = false;
  filterCliente: Cliente[] = null;
  statusfilter: boolean = false;
  modificarGuardar: string = "Modificar";
  cancelarContactar = "Contactar";
  statusEdit = false;
  tipoBusqueda: string = "Buscar/Identificacion"
  searchMode: boolean = false;

  constructor(private formBuilder: FormBuilder, private clientService: ClientesService, private fireauth: AngularFireAuth, private toas: ToastrService) {

  }
  singOut() {
    this.fireauth.auth.signOut();
    this.toas.show('Su sesion ha finalizado correctamente', 'Cerrando Session');
  }
  formCliente: FormGroup;

  validarNumero: any = /^\d*$/;
  validarLetras: any = /^([a-zA-z])*$/;
  validarLetraEspacio: any = /^[A-Za-z\s]*$/;

  ngOnInit() {
    this.loadClientes();
    this.formCliente = new FormGroup(
      {
        id: new FormControl(''),
        nombre: new FormControl('', [Validators.required, Validators.pattern(this.validarLetraEspacio)]),
        apellido: new FormControl('', [Validators.required, Validators.pattern(this.validarLetraEspacio)]),
        direccion: new FormControl('', [Validators.required]),
        telefono: new FormControl('', [Validators.required, Validators.pattern(this.validarNumero)]),
        identificacion: new FormControl('', [Validators.required, Validators.minLength(5), Validators.pattern(this.validarNumero)])
      }
    )

  }

  deleteCliente(id: string) {
    if (confirm('Desea Eliminar este Cliente')) {
      this.clientService.deleteCliente(id, this.fireauth.auth.currentUser.email).then(
        exito => {
          Swal.fire('Exito', 'Se ha eliminado Satisfactoriamente', 'success');
        },
        error => {
          Swal.fire('Error', 'No se ha podido Eliminar', 'warning');
          console.log(error);
        }
      )
    }
  }

  registerClientes() {
    if (this.formCliente.valid) {
      var id = this.formCliente.get('identificacion').value;
      if (this.validarUserNotRepeat(id)) {


        if (this.validarUserNotRepeat(this.formCliente.get('identificacion').value)) {
          let datos = Object.assign({}, this.formCliente.value);
          delete datos.id;
          this.clientService.registerClient(datos, this.fireauth.auth.currentUser.email).then(
            exito => {
              if (exito) {
                Swal.fire('Exito', 'Cliente registrado Correctamente', 'success');
                this.resetForm();
              }
            }
            ,
            error => {
              console.log(error);
              Swal.fire('Error', 'no se ha podido registrar el cliente', 'error');
            }
          );

        }
      }
      else {
        Swal.fire('Advertencia', 'El numero de Identificacion ya esta registrado', 'info');

      }
    } else {
      Swal.fire('Error', 'Verifica los campos indicados', 'error');
    }


  }

  loadClientes() {
    let email = this.fireauth.auth.currentUser.email;
    this.clientService.loadClient(email).subscribe(
      resultado => {
        this.dataClientes = resultado.map(
          items => {
            return {
              id: items.payload.doc.id,
              ...items.payload.doc.data()
            } as Cliente;
          }
        )
      }
    )
  }
  verCliente(datos: any) {

    this.modificarGuardar = "Modificar";
    this.cancelarContactar = "Contactar";
    this.statusEdit = false;
    $('#nombre').attr('readonly', 'readonly');
    $('#apellido').attr('readonly', 'readonly');
    $('#telefono').attr('readonly', 'readonly');
    $('#direccion').attr('readonly', 'readonly');

    this.formCliente.get('identificacion').setValue(datos.identificacion);
    this.formCliente.get('nombre').setValue(datos.nombre);
    this.formCliente.get('apellido').setValue(datos.apellido);
    this.formCliente.get('telefono').setValue(datos.telefono);
    this.formCliente.get('direccion').setValue(datos.direccion);
    this.formCliente.get('id').setValue(datos.id);
    console.log(datos.id);
  }

  modificarCliente() {
    if (!this.statusEdit) {
      this.modificarGuardar = "Guardar";
      this.cancelarContactar = "Cancelar";
      this.statusEdit = true;
      $('#nombre').removeAttr('readonly');
      $('#apellido').removeAttr('readonly');
      $('#telefono').removeAttr('readonly');
      $('#direccion').removeAttr('readonly');
      this.toas.info('Modifique los campos deseados', 'Modificar');
      $('#saveModif').removeAttr("data-dismiss");


    }
    else {
      if (this.formCliente.valid) {
        this.modificarGuardar = "Modificar";
        this.cancelarContactar = "Contactar";
        this.statusEdit = false;
        $('#identificacion').attr('readonly', 'readonly');
        $('#nombre').attr('readonly', 'readonly');
        $('#apellido').attr('readonly', 'readonly');
        $('#telefono').attr('readonly', 'readonly');
        $('#direccion').attr('readonly', 'readonly');
        $('#saveModif').attr("data-dismiss", "modal");
        this.clientService.editCliente(this.formCliente.value, this.fireauth.auth.currentUser.email).then(
          exito => {
            Swal.fire('Exito', 'Cliente modificado Satisfactoriamente', 'success');
            this.formCliente.reset();
          },
          error => {
            this.toas.warning('No se ha podido modificar', 'Atencion');
            console.log(error);
          }

        )
      } else {
        Swal.fire('Error', 'Los campos no son validos', 'error');
      }
      this.loadClientes();
    }
  }
  cancelContact() {
    if (this.statusEdit) {
      this.modificarGuardar = "Modificar";
      this.cancelarContactar = "Contactar";
      this.statusEdit = false;
      $('#nombre').attr('readonly', 'readonly');
      $('#apellido').attr('readonly', 'readonly');
      $('#telefono').attr('readonly', 'readonly');
      $('#direccion').attr('readonly', 'readonly');
      $('#saveModif').removeAttr("data-dismiss");

      this.clienteSelected = {
        id: "",
        data: {
          identificacion: "",
          nombre: "",
          apellido: "",
          telefono: "",
          direccion: ""

        }
      }
    }
    else {
      this.contactar(this.formCliente.get('nombre').value);
      this.statusEdit = false;
    }
  }
  resetForm() {
    this.formCliente.reset();
  }

  contactar(user: string) {
    this.toas.warning('se esta contactando a ' + user, 'Contactar')
  }

  numberResult(number: number) {
    if (number > 0) {
      this.searched = true;
    }
    else {
      this.searched = false;
    }
  }

  searchClient(key: string) {
    if (!this.searchMode) {
      if (key) {
        this.filterCliente = this.dataClientes.filter(function (val) {
          return val.identificacion.toLowerCase().startsWith(key.toLowerCase());
        });
        this.statusfilter = true;
        this.numberResult(this.filterCliente.length);

      }
      else {
        this.filterCliente = null;
        this.statusfilter = false;
      }
    } else {
      if (key) {
        this.filterCliente = this.dataClientes.filter(function (val) {
          if (val.nombre.toLowerCase().startsWith(key.toLowerCase())) {
            return val.nombre.toLowerCase().startsWith(key.toLowerCase());
          }
          if (val.apellido.toLowerCase().startsWith(key.toLowerCase())) {
            return val.apellido.toLowerCase().startsWith(key.toLowerCase())
          }
        });
        this.statusfilter = true;
        this.numberResult(this.filterCliente.length);

      }
      else {
        this.filterCliente = null;
        this.statusfilter = false;
      }

    }

  }
  switchModeSearch() {
    if (!this.searchMode) {
      this.searchMode = true;
      this.tipoBusqueda = "Buscar Nombre/Apelido";
    } else {
      this.searchMode = false;
      this.tipoBusqueda = "Buscar/Identificacion";

    }
  }

  validarUserNotRepeat(id: string): boolean {
    var ide = this.formCliente.get('identificacion').value;

    var result = this.dataClientes.filter(function (val) {
      return val.identificacion.toLowerCase().startsWith(ide.toLowerCase());
    });

    if(result.length>0){
      return false
    }else{
      return true;
    }
  }

  get nombre() {
    return this.formCliente.get('nombre');
  }
  get apellido() {
    return this.formCliente.get('apellido');
  }
  get telefono() {
    return this.formCliente.get('telefono');
  }
  get direccion() {
    return this.formCliente.get('direccion');
  }
  get identificacion() {
    return this.formCliente.get('identificacion');
  }
  get id() {
    return this.formCliente.get('id');
  }
}
