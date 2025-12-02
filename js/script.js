let listaOrganizaciones = [];    
let donacionesActuales = [];    
let ultimoIdResaltado = null;     
let identificadorTramite = 1;    

function iniciarAplicacion() {
    cargarOrganizacionesDesdeJson()
        .then(function () {
            crearTarjetasOrganizaciones();
            registrarEventosDelFormulario();
        });
}
/* Cargar organizaciones desde json-server */
function cargarOrganizacionesDesdeJson() {
    return fetch("http://localhost:3000/organizaciones")
        .then(function (respuesta) {
            if (respuesta.ok) {
                return respuesta.json();
            } else {
                throw new Error("Error HTTP: " + respuesta.status + " (" + respuesta.statusText + ")");
            }
        })
        .then(function (datos) {  
            let listaDatosOrganizaciones = [];
            if (Array.isArray(datos)) {
                listaDatosOrganizaciones = datos;
            } else if (datos && Array.isArray(datos.organizaciones)) {
                listaDatosOrganizaciones = datos.organizaciones;
            }
            listaOrganizaciones = listaDatosOrganizaciones.map(function (organizacionOriginal) {
                return normalizarOrganizacion(organizacionOriginal);
            });
        })
        .catch(function (error) {
            console.error("Error al cargar los datos del JSON:", error);
            listaOrganizaciones = [];
        });
}
/*Normalizar la organización (incluyendo la imagen) */
function normalizarOrganizacion(organizacionOriginal) {
    let esOrganizacionDePersonas =
        typeof organizacionOriginal.acogida !== "undefined" ||
        typeof organizacionOriginal.rangoEdad !== "undefined";

    return {
        id: String(organizacionOriginal.id), 
        nombre: organizacionOriginal.nombre,
        tipo: esOrganizacionDePersonas ? "personas" : "animales",
        acogida: esOrganizacionDePersonas ? Boolean(organizacionOriginal.acogida) : null,
        rangoEdad: esOrganizacionDePersonas ? (organizacionOriginal.rangoEdad || null) : null,
        multiraza: !esOrganizacionDePersonas ? Boolean(organizacionOriginal.multiraza) : null,
        ambito: !esOrganizacionDePersonas ? (organizacionOriginal.ambito || null) : null,
        rutaImagen: organizacionOriginal.imagen || ""   
    };
}

function crearTarjetasOrganizaciones() {
    let contenedorOrganizaciones = document.getElementById("contenedorPrincipal");
    contenedorOrganizaciones.innerHTML = "";

    for (let i = 0; i < listaOrganizaciones.length; i++) {
        let organizacion = listaOrganizaciones[i];

        let tarjetaOrganizacion = document.createElement("div");
        tarjetaOrganizacion.className = "OrganizacionesBeneficas";

        let imagenOrganizacion = document.createElement("img");
        imagenOrganizacion.className = "logoImagen";
        imagenOrganizacion.alt = organizacion.nombre;
        imagenOrganizacion.src = organizacion.rutaImagen;

        let nombreOrganizacion = document.createElement("div");
        nombreOrganizacion.className = "nombreCausasBeneficas";
        nombreOrganizacion.textContent = organizacion.nombre;

        let contenedorAportacion = document.createElement("div");
        contenedorAportacion.className = "PrecioAportacion";

        let campoCantidad = document.createElement("input");
        campoCantidad.type = "number";
        campoCantidad.min = "0";
        campoCantidad.step = "0.01";
        campoCantidad.placeholder = "€";
        campoCantidad.className = "PrecioAportacion";

        contenedorAportacion.appendChild(campoCantidad);
        imagenOrganizacion.addEventListener("click", function () {
            let cantidadIntroducida = parseFloat(campoCantidad.value);

            if (!isNaN(cantidadIntroducida) && cantidadIntroducida > 0) {
                registrarDonacion(organizacion.nombre, cantidadIntroducida);
                campoCantidad.value = "";
            }
        });
        tarjetaOrganizacion.appendChild(imagenOrganizacion);
        tarjetaOrganizacion.appendChild(nombreOrganizacion);
        tarjetaOrganizacion.appendChild(contenedorAportacion);
        contenedorOrganizaciones.appendChild(tarjetaOrganizacion);
    }
}
/*Ajuste pequeño en registrarDonacion para el scroll (punto 1.3) */
function registrarDonacion(nombreOrganizacion, cantidad) {
    let organizacion = buscarOrganizacionPorNombre(nombreOrganizacion);
    let idOrganizacion = organizacion ? organizacion.id : "NOMBRE_NO_EN_JSON";

    let registroDonacion = {
        idOrganizacion: idOrganizacion,
        nombre: nombreOrganizacion,
        cantidad: cantidad,
        fechaHora: new Date()
    };

    donacionesActuales.push(registroDonacion);

    let contenedorListaDonaciones = document.getElementById("listaDonaciones");
    let lineaDonacion = document.createElement("div");
    lineaDonacion.className = "LineaDonacion";
    lineaDonacion.setAttribute("data-id-org", String(idOrganizacion));
    lineaDonacion.textContent = nombreOrganizacion + " " + formatearDinero2(cantidad) + " €";

    contenedorListaDonaciones.appendChild(lineaDonacion);

    contenedorListaDonaciones.scrollTop = contenedorListaDonaciones.scrollHeight;

    if (ultimoIdResaltado !== null && ultimoIdResaltado !== idOrganizacion) {
        desmarcarLineasDeOrganizacion(ultimoIdResaltado);
    }

    marcarLineasDeOrganizacion(idOrganizacion);
    ultimoIdResaltado = idOrganizacion;
}

function marcarLineasDeOrganizacion(idOrg) {
let lineas = document.querySelectorAll('#listaDonaciones .LineaDonacion[data-id-org="' + String(idOrg) + '"]');
    for (let i = 0; i < lineas.length; i++) {
        lineas[i].classList.add("LineaDonacion--resaltada");
    }
}

function desmarcarLineasDeOrganizacion(idOrg) {
let lineas = document.querySelectorAll('#listaDonaciones .LineaDonacion[data-id-org="' + String(idOrg) + '"]');
    for (let i = 0; i < lineas.length; i++) {
        lineas[i].classList.remove("LineaDonacion--resaltada");
    }
}

function buscarOrganizacionPorNombre(nombre) {
let nombreMayus = (nombre || "").toLocaleUpperCase();
    for (let i = 0; i < listaOrganizaciones.length; i++) {
    let org = listaOrganizaciones[i];
        if ((org.nombre || "").toLocaleUpperCase() === nombreMayus) {
            return org;
        }
    }
    return null;
}
/* SECCIÓN DE FORMULARIO DE DONACIÓN */

function registrarEventosDelFormulario() {
    let formulario = document.getElementById("formularioDonacion");
    let radiosSocio = document.getElementsByName("esSocio");
    for (let i = 0; i < radiosSocio.length; i++) {
        radiosSocio[i].addEventListener("change", gestionarVisibilidadCodigoSocio);
    }
    let botonLimpiar = document.getElementById("botonLimpiarFormulario");
    botonLimpiar.addEventListener("click", limpiarFormularioYOcultarCodigoSocio);
    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();
        console.log("Formulario enviado (lógica de validación se añadirá en la siguiente parte)");
    });
}

function gestionarVisibilidadCodigoSocio() {
    let campoCodigoSocio = document.getElementById("contenedorCampoCodigoSocio");

    let opcionSeleccionada = document.querySelector('input[name="esSocio"]:checked');

    if (opcionSeleccionada && opcionSeleccionada.value === "si") {
        campoCodigoSocio.classList.remove("oculto");
    } else {
        campoCodigoSocio.classList.add("oculto");
        document.getElementById("codigoSocio").value = "";  
    }
}

function limpiarFormularioYOcultarCodigoSocio() {
    let campoCodigoSocio = document.getElementById("contenedorCampoCodigoSocio");

    campoCodigoSocio.classList.add("oculto");
    document.getElementById("codigoSocio").value = "";
}


function formatearFechaHoraCompleta(fecha) {
let dia = String(fecha.getDate()).padStart(2, "0");
let mes = String(fecha.getMonth() + 1).padStart(2, "0");
let anio = fecha.getFullYear();
let hora = String(fecha.getHours()).padStart(2, "0");
let minutos = String(fecha.getMinutes()).padStart(2, "0");
return dia + "/" + mes + "/" + anio + " " + hora + ":" + minutos;
}
function formatearMesAnio(fecha) {
let mes = String(fecha.getMonth() + 1).padStart(2, "0");
let anio = fecha.getFullYear();
 return mes + "/" + anio;
}
function aplicarRedondeoHaciaAbajoDosDecimales(valor) {
    return Math.floor(valor * 100) / 100;
}
function formatearDinero2(valor) {
let v = aplicarRedondeoHaciaAbajoDosDecimales(valor);
 return v.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatearDinero3(valor) {
return Number(valor).toLocaleString("es-ES", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}
document.addEventListener("DOMContentLoaded", function () {
iniciarAplicacion();
});