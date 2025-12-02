
window.onload = function () {
    let botonVolver = document.getElementById("botonVolver");
    let botonTerminar = document.getElementById("botonTerminar");
    botonVolver.addEventListener("click", function () {
        window.close();
    });
    botonTerminar.addEventListener("click", finalizarPedido);
    mostrarResumenEnEmergente();
};



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