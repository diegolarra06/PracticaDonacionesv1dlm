
window.onload = function () {
    let botonVolver = document.getElementById("botonVolver");
    let botonTerminar = document.getElementById("botonTerminar");
    botonVolver.addEventListener("click", function () {
        window.close();
    });
    botonTerminar.addEventListener("click", finalizarPedido);
    mostrarResumenEnEmergente();
};

function mostrarResumenEnEmergente() {

    let datosFormulario = JSON.parse(sessionStorage.getItem("datosFormulario"));
    let resumenDonaciones = JSON.parse(sessionStorage.getItem("resumenDonaciones"));

    let divDatosUsuario = document.getElementById("datosUsuario");
    let divResumenDonaciones = document.getElementById("resumenDonaciones");

    divDatosUsuario.innerHTML = "";
    divResumenDonaciones.innerHTML = "";

    let pNombre = document.createElement("p");
    pNombre.textContent = "Nombre: " + datosFormulario.nombre + " " + datosFormulario.apellidos;
    divDatosUsuario.appendChild(pNombre);

    let pDireccion = document.createElement("p");
    pDireccion.textContent = "Dirección: " + datosFormulario.direccion;
    divDatosUsuario.appendChild(pDireccion);

    let pCorreo = document.createElement("p");
    pCorreo.textContent = "Correo electrónico: " + datosFormulario.correo;
    divDatosUsuario.appendChild(pCorreo);

    let pPago = document.createElement("p");
    pPago.textContent = "Forma de pago: " + datosFormulario.formaPago;
    divDatosUsuario.appendChild(pPago);

    if (datosFormulario.esSocio === "si") {
        let pSocio = document.createElement("p");
        pSocio.textContent = "Código de socio: " + datosFormulario.codigoSocio;
        divDatosUsuario.appendChild(pSocio);
    }

    let tituloDonaciones = document.createElement("h3");
    tituloDonaciones.textContent = "Donaciones realizadas:";
    divResumenDonaciones.appendChild(tituloDonaciones);

    for (let i = 0; i < resumenDonaciones.length; i++) {
        let d = resumenDonaciones[i];

        let linea = document.createElement("p");
        linea.textContent =
            d.nombre + ": " +
            d.numeroDonaciones + " donaciones — Total: " +
            d.importeTotal.toFixed(2) + " €";

        divResumenDonaciones.appendChild(linea);
    }
}

function finalizarPedido() {
let datosFormulario = JSON.parse(sessionStorage.getItem("datosFormulario"));
let resumenDonaciones = JSON.parse(sessionStorage.getItem("resumenDonaciones"));

let objetoTramite = {
    fecha: generarMesAnioActual(),
    datosUsuario: datosFormulario,
    donaciones: resumenDonaciones.map(function (d) {
    return {
    idOrganizacion: d.idOrganizacion,
    importeTotal: Number(d.importeTotal.toFixed(2)),
    numDonaciones: d.numeroDonaciones
        };
    })
};
    fetch("http://localhost:3000/tramiteDonacion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(objetoTramite)
    })
    .then(function (respuesta) {
    if (!respuesta.ok) {
    throw new Error("Error HTTP " + respuesta.status);
    }
    return respuesta.json();
    })
    .then(function () {
    window.opener.reiniciarPaginaTrasTramite();
    window.close();
    })
    .catch(function (error) {
    alert("Error al guardar el trámite: " + error);
    });
}

function generarMesAnioActual() {
let hoy = new Date();
let mes = String(hoy.getMonth() + 1).padStart(2, "0");
let anio = hoy.getFullYear();
return mes + "/" + anio;
}