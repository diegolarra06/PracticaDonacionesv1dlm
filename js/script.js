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