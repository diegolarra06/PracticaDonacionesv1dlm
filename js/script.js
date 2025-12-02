let listaOrganizaciones = [];    
let donacionesActuales = [];    
let ultimoIdResaltado = null;     
let identificadorTramite = 1;    

function iniciarAplicacion() {
    cargarOrganizacionesDesdeJson()
        .then(function () {
            crearTarjetasOrganizaciones();
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
function finalizarTramite() {
if (donacionesActuales.length === 0) {
    return;
    }
let fechaFin = new Date();
let agrupado = agruparDonacionesPorOrganizacion(donacionesActuales);
let listaResumen = [];
for (let clave in agrupado) {
    if (agrupado[clave]) {
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

let mensajes = construirMensajesPeculiaridades(listaResumen.map(function (x) { return x.nombre; }));
alert(mensajes.join("\n"));

guardarTramiteComoJson(fechaFin, listaResumen);

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

function guardarTramiteComoJson(fechaFin, listaResumen) {
let tramite = {
id: identificadorTramite++,
fecha: formatearMesAnio(fechaFin),
donaciones: listaResumen.map(function (o) {
let ref = buscarOrganizacionPorNombre(o.nombre);
let idRef = ref ? ref.id : o.nombre;
return {
idOrganizacion: idRef, importeTotal: aplicarRedondeoHaciaAbajoDosDecimales(o.importeTotal), numDonaciones: o.numDonaciones
    };
})
};
let anterior = localStorage.getItem("historialTramites");
let lista = anterior ? JSON.parse(anterior) : [];
lista.push(tramite);
localStorage.setItem("historialTramites", JSON.stringify(lista));
}
function reiniciarTodo() {
let lista = document.getElementById("listaDonaciones");
let resultados = document.getElementById("Resultados");
lista.innerHTML = "";
resultados.innerHTML = "";
donacionesActuales = [];
ultimoIdResaltado = null;
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