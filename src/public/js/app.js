
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import asistencia from './asistencia';
import eliminarComentario from './eliminarComentario';

// obtener valores de la base de datos
const lat = document.querySelector('#lat').value || -12.121069;
const lng = document.querySelector('#lng').value || -77.029702;
const direccion = document.querySelector('#direccion').value || '' ;
const map = L.map('map').setView([lat, lng], 15);
let markers = new L.FeatureGroup().addTo(map)
let marker;

// utilizar el provaider y GEoCoder
const geocodeService = L.esri.Geocoding.geocodeService()

// colocar el pin en edición
if(lat && lng){
  // agregar el pin
  marker = new L.marker([lat,lng],{
    draggable:true,
    autoPan:true
  }).addTo(map).bindPopup(direccion).openPopup()
  // asignar al contenedor
  markers.addLayer(marker)

  // detectar movimientos del marker
  marker.on('moveend',function(e){
     marker = e.target;
    // console.log(marker.getLatLng());
    const posicion = marker.getLatLng();
    map.panTo(new L.LatLng(posicion.lat,posicion.lng))
    // reverse GeoCode, cuando el usuario reubica el pin
    geocodeService.reverse().latlng(posicion,15).run(function(error,result){
      llenarInputs(result)
      // console.log(result);
      // asigna los valores al popup del marker
      marker.bindPopup(result.address.LongLabel)
    })
  })
}

document.addEventListener('DOMContentLoaded', () => {
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  const buscador = document.querySelector('#formbuscador')
  buscador.addEventListener('input',buscarDireccion)
})

function buscarDireccion(e){
  if(e.target.value.length > 8){
    // si existe un pin anterior limpiarlo
    if(marker){
      map.removeLayer(marker)
    }

    // // utilizar el provaider y GEoCoder
    // const geocodeService = L.esri.Geocoding.geocodeService()
    const provider = new OpenStreetMapProvider();
    // console.log(provider);
    provider.search({query:e.target.value}).then(resultado => {
      // console.log(e.target.value);
      // console.log(resultado);
      // console.log(resultado[0].bounds[0]);
      
      geocodeService.reverse().latlng(resultado[0].bounds[0],15).run(function(error,result){
        llenarInputs(result)
        // console.log(result);
         // mostrar el mapa 
        map.setView(resultado[0].bounds[0],15)

        // agregar el pin
        marker = new L.marker(resultado[0].bounds[0],{
          draggable:true,
          autoPan:true
        }).addTo(map).bindPopup(resultado[0].label).openPopup()
        // asignar al contenedor
        markers.addLayer(marker)

        // detectar movimientos del marker
        marker.on('moveend',function(e){
          marker = e.target;
          // console.log(marker.getLatLng());
          const posicion = marker.getLatLng();
          map.panTo(new L.LatLng(posicion.lat,posicion.lng))
          // reverse GeoCode, cuando el usuario reubica el pin
          geocodeService.reverse().latlng(posicion,15).run(function(error,result){
            llenarInputs(result)
            // console.log(result);
            // asigna los valores al popup del marker
            marker.bindPopup(result.address.LongLabel)
          })
        })
      })

    })
    
  }
  
}

function llenarInputs(resultados){
  // console.log(resultados);
  document.querySelector('#direccion').value = resultados.address.Address ||'';
  document.querySelector('#ciudad').value = resultados.address.City || '';
  document.querySelector('#estado').value = resultados.address.Region || '';
  document.querySelector('#pais').value = resultados.address.CountryCode || '';
  document.querySelector('#lat').value = resultados.latlng.lat || '';
  document.querySelector('#lng').value = resultados.latlng.lng || '';
}