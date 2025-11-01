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
/* ENUNCIADO 4.1: Sustituir precios por input numérico*/
function prepararTarjetasConInputs() {
let tarjetas = document.querySelectorAll("#contenedorPrincipal .OrganizacionesBeneficas");
for (let i = 0; i < tarjetas.length; i++) {
let tarjeta = tarjetas[i];
let zonaPrecio = tarjeta.querySelector(".PrecioAportacion");
zonaPrecio.textContent = "";
let input = document.createElement("input");
input.type = "number";
input.min = "0";
input.step = "0.01";
input.placeholder = "€";
input.className = "PrecioAportacion";
zonaPrecio.appendChild(input);
let imagen = tarjeta.querySelector(".logoImagen");
imagen.addEventListener("click", function () {
    let nombreOrg = tarjeta.querySelector(".nombreCausasBeneficas").textContent.trim();
    let cantidad = parseFloat(input.value);
        if (!isNaN(cantidad) && cantidad > 0) {
            registrarDonacion(nombreOrg, cantidad);
            input.value = "";
            }
        });
    }
}
/* ENUNCIADO 4.2: Lateral con acumulación y sombreado dinámico*/
function registrarDonacion(nombreOrganizacion, cantidad) {
let organizacion = buscarOrganizacionPorNombre(nombreOrganizacion);
let idOrg = organizacion ? organizacion.id : "NOMBRE_NO_EN_JSON";
let registro = {
idOrganizacion: idOrg,
nombre: nombreOrganizacion,
cantidad: cantidad,
fechaHora: new Date()
};

donacionesActuales.push(registro);
let lista = document.getElementById("listaDonaciones");
let linea = document.createElement("div");
linea.className = "LineaDonacion";
linea.setAttribute("data-id-org", String(idOrg));
linea.textContent = nombreOrganizacion + " " + formatearDinero2(cantidad) + " €";
lista.appendChild(linea);
    if (ultimoIdResaltado !== null && ultimoIdResaltado !== idOrg) {
        desmarcarLineasDeOrganizacion(ultimoIdResaltado);
    }
marcarLineasDeOrganizacion(idOrg);
ultimoIdResaltado = idOrg;
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
