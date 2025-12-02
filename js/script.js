let listaOrganizaciones = [];    
let donacionesActuales = [];    
let ultimoIdResaltado = null;     
   
document.addEventListener("DOMContentLoaded", iniciarAplicacion);
function iniciarAplicacion() {
    cargarOrganizacionesDesdeJson().then( () => {
            crearTarjetasOrganizaciones();
            registrarEventosDelFormulario();
        });
}

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

function registrarEventosDelFormulario() {
    let formulario = document.getElementById("formularioDonacion");
    let radiosSocio = document.getElementsByName("esSocio");
    for (let i = 0; i < radiosSocio.length; i++) {
        radiosSocio[i].addEventListener("change", gestionarVisibilidadCodigoSocio);
    }
    let botonLimpiar = document.getElementById("botonLimpiarFormulario");
    botonLimpiar.addEventListener("click", limpiarFormularioYOcultarCodigoSocio);
    formulario.addEventListener("submit", function (evento) {
    if (!validarFormulario(evento)) {
        return; 
    }
    abrirVentanaEmergenteConDatos();
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

function validarFormulario(evento) {
    let formulario = document.getElementById("formularioDonacion");
    let listaErrores = [];
    restaurarColorLabels();
    let campos = [
        { id: "nombreDonante", mensajePersonal: null },
        { id: "apellidosDonante", mensajePersonal: null },
        { id: "direccionDonante", mensajePersonal: null },
        { id: "correoElectronicoDonante", mensajePersonal: null },
        { id: "codigoSocio", mensajePersonal: "El código de socio no cumple el formato requerido." }
    ];
    for (let i = 0; i < campos.length; i++) {

        let campo = document.getElementById(campos[i].id);
        let labelCampo = obtenerLabelDeCampo(campos[i].id);
        if (campo.parentElement.classList.contains("oculto")) {
        continue;
        }
        if (!campo.validity.valid) {
            labelCampo.style.color = "red";
            let mensaje = campos[i].mensajePersonal || campo.validationMessage || "Este campo no es válido.";
            listaErrores.push(labelCampo.textContent + ": " + mensaje);
        }
    }
    validarRadios("formaPago", "Forma de pago", listaErrores);
    validarRadios("esSocio", "¿Tiene tarjeta de socio?", listaErrores);
    if (listaErrores.length > 0) {
        evento.preventDefault();
        alert(listaErrores.join("\n"));
        return false;
    }
    console.log("Formulario correcto. Pasando a ventana emergente..");
    return true;
}


function validarRadios(nombreGrupo, nombreMostrar, listaErrores) {
    let opciones = document.getElementsByName(nombreGrupo);
    let algunaMarcada = false;
    for (let i = 0; i < opciones.length; i++) {
        if (opciones[i].checked) {
        algunaMarcada = true;
        break;
        }
    }
    if (!algunaMarcada) {
        listaErrores.push(nombreMostrar + ": Debe seleccionar una opción.");
        let label = opciones[0].closest("fieldset").querySelector("legend");
        label.style.color = "red";
    }
}

function restaurarColorLabels() {
    let labels = document.querySelectorAll("label, fieldset legend");
    for (let i = 0; i < labels.length; i++) {
        labels[i].style.color = "";
    }
}

function obtenerLabelDeCampo(idCampo) {
    return document.querySelector('label[for="' + idCampo + '"]');
}

function obtenerDatosDelFormulario() {
    let datos = {};

    datos.nombre = document.getElementById("nombreDonante").value.trim();
    datos.apellidos = document.getElementById("apellidosDonante").value.trim();
    datos.direccion = document.getElementById("direccionDonante").value.trim();
    datos.correo = document.getElementById("correoElectronicoDonante").value.trim();

    let formaPago = document.querySelector('input[name="formaPago"]:checked');
    datos.formaPago = formaPago ? formaPago.value : "";

    let esSocio = document.querySelector('input[name="esSocio"]:checked');
    datos.esSocio = esSocio ? esSocio.value : "";

    datos.codigoSocio = document.getElementById("codigoSocio").value.trim();

    return datos;
}


function construirResumenDeDonaciones() {
    let listaResumen = [];

    for (let i = 0; i < donacionesActuales.length; i++) {
        let donacion = donacionesActuales[i];
        let encontrado = null;
        for (let j = 0; j < listaResumen.length; j++) {
            if (listaResumen[j].idOrganizacion === donacion.idOrganizacion) {
                encontrado = listaResumen[j];
                break;
            }
        }
        if (encontrado === null) {
            encontrado = {
                idOrganizacion: donacion.idOrganizacion,
                nombre: donacion.nombre,
                importeTotal: 0,
                numeroDonaciones: 0
            };
            listaResumen.push(encontrado);
        }
        encontrado.importeTotal += donacion.cantidad;
        encontrado.numeroDonaciones++;
    }
    return listaResumen;
}

function abrirVentanaEmergenteConDatos() {
let datosFormulario = obtenerDatosDelFormulario();
let resumenDonaciones = construirResumenDeDonaciones();

sessionStorage.setItem("datosFormulario", JSON.stringify(datosFormulario));
sessionStorage.setItem("resumenDonaciones", JSON.stringify(resumenDonaciones));

let opcionesVentana = "width=500,height=300,menubar=no,toolbar=no,location=no,status=no";
window.open("VentanaEmergente.html", "ventanaResumen", opcionesVentana);
}

function reiniciarPaginaTrasTramite() {
donacionesActuales = [];
ultimoIdResaltado = null;
document.getElementById("listaDonaciones").innerHTML = "";
let formulario = document.getElementById("formularioDonacion");
formulario.reset();
limpiarFormularioYOcultarCodigoSocio();
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