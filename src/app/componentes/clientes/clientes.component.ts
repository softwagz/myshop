import { Component, OnInit } from '@angular/core';
import { ClientesService } from '../../Servicios/clientes.service';
import { Cliente } from '../../Modelos/cliente';
import { AngularFireAuth } from '@angular/fire/auth';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as $ from 'jquery';



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

  constructor(private clientService: ClientesService, private fireauth: AngularFireAuth, private toas: ToastrService) {

  }
  singOut(){
    this.fireauth.auth.signOut();
    this.toas.show('Su sesion ha finalizado correctamente','Cerrando Session');
  }

  ngOnInit() {
    this.loadClientes();
  }

  deleteCliente(id: string) {
    if (confirm('Desea Eliminar este Cliente')) {
      this.clientService.deleteCliente(id, this.fireauth.auth.currentUser.email).then(
        exito => {
          this.toas.success('Se ha completado su operacion correctamente', 'Cliente Eliminado')
        },
        error => {
          this.toas.info('no se ha podido completar su operacion', 'Error al Eliminar');
          console.log(error);
        }
      )
    }
  }

  registerClientes(data: NgForm) {
    let datos = Object.assign({}, data.value);
    delete datos.id;
    this.clientService.registerClient(datos, this.fireauth.auth.currentUser.email).then(
      exito => {
        if (exito) {
          this.toas.success('Usuario Registrado con Exito', 'Operacio Completada');
          this.resetForm(data);
        }
      }
      ,
      error => {
        console.log(error);
        this.toas.error('Error al Registrar el usuario', 'Atencion');
      }
    );


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

  resetForm(form: NgForm) {
    form.resetForm();
    this.toas.success('Clear Succes', 'Formulario');
  }

  verCliente(datos: any) {
    this.clienteSelected = datos;

  }
  modificarCliente(form: NgForm) {
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
      this.modificarGuardar = "Modificar";
      this.cancelarContactar = "Contactar";
      this.statusEdit = false;
      $('#identificacion').attr('readonly', 'readonly');
      $('#nombre').attr('readonly', 'readonly');
      $('#apellido').attr('readonly', 'readonly');
      $('#telefono').attr('readonly', 'readonly');
      $('#direccion').attr('readonly', 'readonly');
      $('#saveModif').attr("data-dismiss", "modal");
      this.toas.show('se estan guardando los cambios', 'Modificando');
      this.clientService.editCliente(form, this.fireauth.auth.currentUser.email).then(
        exito => {
          this.toas.success('Cliente Modificado Satisfactoriamente', 'Modificado');
          form.reset();
        },
        error => {
          this.toas.warning('No se ha podido modificar', 'Atencion');
          console.log(error);
        }

      )


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
      this.contactar(this.clienteSelected.nombre);
      this.statusEdit = false;
    }
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
    if (key) {
      this.filterCliente = this.dataClientes.filter(function (val) {
        return val.nombre.toLowerCase().startsWith(key.toLowerCase());
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
