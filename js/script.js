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
/* 
   ENUNCIADO 4.4 y 4.5: Finalizar trámite, mostrar resultados ordenados e importes */
function finalizarTramite() {
if (donacionesActuales.length === 0) {
    return;
    }
let fechaFin = new Date();
let agrupado = agruparDonacionesPorOrganizacion(donacionesActuales);
let listaResumen = [];
for (let clave in agrupado) {
    if (Object.prototype.hasOwnProperty.call(agrupado, clave)) {
        listaResumen.push(agrupado[clave]);
    }
}
listaResumen.sort(function (a, b) {
    return b.nombre.localeCompare(a.nombre, "es");
    });
let totalGlobal = 0;
let totalNumeroDonaciones = 0;
    for (let i = 0; i < listaResumen.length; i++) {
    totalGlobal += listaResumen[i].importeTotal;
    totalNumeroDonaciones += listaResumen[i].numDonaciones;
}
let mediaGlobal = totalNumeroDonaciones > 0 ? (totalGlobal / totalNumeroDonaciones) : 0;
let zonaResultados = document.getElementById("Resultados");
zonaResultados.innerHTML = "";
let parrafoFecha = document.createElement("p"); 
parrafoFecha.textContent = "Fecha de compra: " + formatearFechaHoraCompleta(fechaFin);
zonaResultados.appendChild(parrafoFecha);
for (let j = 0; j < listaResumen.length; j++) {
let o = listaResumen[j];
let mediaOrg = o.numDonaciones > 0 ? (o.importeTotal / o.numDonaciones) : 0;
let linea = document.createElement("p"); 
linea.textContent = o.nombre + " ---- " + o.numDonaciones + " donaciones --- " +
formatearDinero2(mediaOrg) + "€ -- " + formatearDinero2(o.importeTotal) + "€";
    zonaResultados.appendChild(linea);
    }

let lineaTotal = document.createElement("p"); 
lineaTotal.textContent = "Aporte total : " + formatearDinero2(totalGlobal) + " €";
zonaResultados.appendChild(lineaTotal);
let lineaMedia = document.createElement("p"); 
lineaMedia.textContent = "Aporte medio: " + formatearDinero3(mediaGlobal) + " €/donación";
zonaResultados.appendChild(lineaMedia);
// ENUNCIADO 6
let mensajes = construirMensajesPeculiaridades(listaResumen.map(function (x) { return x.nombre; }));
alert(mensajes.join("\n"));
// ENUNCIADO 2 (JSON)
guardarTramiteComoJson(fechaFin, listaResumen);
// ENUNCIADO 7: limpieza total a los 10s
setTimeout(reiniciarTodo, 10000);
}

function agruparDonacionesPorOrganizacion(lista) {
let mapa = {};
    for (let i = 0; i < lista.length; i++) {
    let d = lista[i];
    let clave = String(d.idOrganizacion);
    if (!mapa[clave]) {
    mapa[clave] = { idOrganizacion: d.idOrganizacion, nombre: d.nombre, importeTotal: 0, numDonaciones: 0 };     
}
    mapa[clave].importeTotal += d.cantidad;
    mapa[clave].numDonaciones += 1;
}

return mapa;
}

function construirMensajesPeculiaridades(nombresSeleccionados) {
let mensajes = [];
    for (let i = 0; i < nombresSeleccionados.length; i++) {
    let nombre = nombresSeleccionados[i];
    let org = buscarOrganizacionPorNombre(nombre);
    if (org) {
    if (org.tipo === "personas") {
    let frase = org.nombre + " trabaja con personas, está enfocada en la " +(org.rangoEdad || "—") + " y " + (org.acogida ? "tramita" : "no tramita") + " acogidas.";
    mensajes.push(frase);
    } 
    else 
    {
    let base = org.multiraza ? "con todo tipo de animales" : "con un ámbito específico de especies";
    let amb = org.ambito ? (" a nivel " + org.ambito) : "";
    let frase2 = org.nombre + " trabaja " + base + amb + ".";
    mensajes.push(frase2);
    }
    } else {
    mensajes.push(nombre + ": datos específicos no disponibles en el JSON.");
    }
}
return mensajes;

}
