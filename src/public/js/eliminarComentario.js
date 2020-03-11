import axios from 'axios'
import Swal from 'sweetalert2'

document.addEventListener('DOMContentLoaded', ()=> {
  const formsEliminar = document.querySelectorAll('.eliminar-comentario')
  // revisar q exista los formulario
  if(formsEliminar.length > 0){
    formsEliminar.forEach(form => {
      form.addEventListener('submit',eliminarComentario)
    })
  }
})

function eliminarComentario(e){
  e.preventDefault();

  Swal.fire({
    title: '¿Eliminar Comentario?',
    text: "Un comentario eliminado no se puede recuperar!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Borrar',
    cancelButtonText:'Cancelar'
  }).then((result) => {
    if (result.value) {

      // tomar en id del comentario
      const comentarioId = this.children[0].value
      // console.log(comentarioId);
      
      // crear el objeto
      const datos= {
        comentarioId
      }

      // ejecutar axios y pasar los datos
      axios.post(this.action,datos)
      .then(respuesta => {
        // console.log(respuesta);
        Swal.fire('Eliminado',respuesta.data,'success')

        // eliminar del DOM
        this.parentElement.parentElement.remove()
      }).catch(error=> {
        // console.log(error.response);
        if(error.response.status === 403 || error.response.status === 404){
          Swal.fire('Error',error.response.data,'error')
        }
      })
    }
  })
  // console.log(this.action);

  
}