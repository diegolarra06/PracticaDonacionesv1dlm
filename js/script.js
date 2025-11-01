let listaOrganizaciones = [];    
let donacionesActuales = [];    
let ultimoIdResaltado = null;     
let identificadorTramite = 1;    

function iniciarAplicacion() {
cargarDatosDesdeJson()
.then(function () {
prepararTarjetasConInputs();
let botonFinal = document.getElementById("botonFinal");
botonFinal.addEventListener("click", finalizarTramite);
});
}
/* ENUNCIADO 1-3: Cargar JSON (AJAX con fetch)*/
function cargarDatosDesdeJson() {
return fetch("").then(function (respuesta) {
return respuesta.json();
})
.then(function (datos) {
listaOrganizaciones = (datos.organizaciones || []).map(function (org) {
return normalizarOrganizacion(org);
});
})
.catch(function () {
listaOrganizaciones = [];
});
}

function normalizarOrganizacion(org) {
let esPersonas = (typeof org.acogida !== "undefined") || (typeof org.rangoEdad !== "undefined");
return {
    id: org.id,
    nombre: org.nombre,
    tipo: esPersonas ? "personas" : "animales",
    acogida: esPersonas ? !!org.acogida : null,
    rangoEdad: esPersonas ? (org.rangoEdad || null) : null,
    multiraza: !esPersonas ? !!org.multiraza : null,
    ambito: !esPersonas ? (org.ambito || null) : null
    };
}