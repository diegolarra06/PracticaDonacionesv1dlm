let valoresDeLasAportaciones = [8, 9, 13, 20, 15, 17, 16, 18, 25, 14];
let listaDeAportaciones = [];
let dineroTotalAportado = 0;
let numeroTotalDeAportaciones = 0;
let tramiteEstaFinalizado = false;

function agregarAportacion(indice) {
    if (tramiteEstaFinalizado) {
        reiniciarTramite();
    }
    listaDeAportaciones.push(indice);
    dineroTotalAportado += valoresDeLasAportaciones[indice];
    numeroTotalDeAportaciones++;
}

function mostrarResultados() {
    if (listaDeAportaciones.length === 0) {
        return;
    }
    tramiteEstaFinalizado = true;
    let conteoPorOrganizacion = Array.from({ length: valoresDeLasAportaciones.length }, () => 0);

    listaDeAportaciones.forEach(function(indice) {
        conteoPorOrganizacion[indice]++;
    });

    const contenedor = document.getElementById('contenedorPrincipal');
    const organizaciones = contenedor.getElementsByClassName('OrganizacionesBeneficas');
    let resumenDeAportaciones = conteoPorOrganizacion.map(function(cantidad, indice) {
            return { 
                nombre: organizaciones[indice].getElementsByClassName('nombreCausasBeneficas')[0].textContent,
                cantidad: cantidad 
                }; })
        .filter(function(elemento) {
            return elemento.cantidad > 0;
        });
        resumenDeAportaciones.sort(function(a, b) {
        if (a.nombre > b.nombre) {
            return -1;
        }
        if (a.nombre < b.nombre) {
            return 1;
        }
        return 0;
    });

    const contenedorResultados = document.getElementById('Resultados');
    contenedorResultados.innerHTML = '';

    resumenDeAportaciones.forEach(function(resumen) {
        const parrafo = document.createElement('p');
        parrafo.textContent = resumen.nombre + ' ---- ' + resumen.cantidad + 
            (resumen.cantidad > 1 ? ' aportaciones' : ' aportación');
        contenedorResultados.appendChild(parrafo);
    });

    const parrafoTotal = document.createElement('p');
    parrafoTotal.textContent = 'Donación final: ' + dineroTotalAportado + ' €';
    contenedorResultados.appendChild(parrafoTotal);

    const parrafoMedia = document.createElement('p');
    let media = dineroTotalAportado / numeroTotalDeAportaciones;
    parrafoMedia.textContent = 'Donación media: ' + media.toFixed(2) + ' €/aportación';
    contenedorResultados.appendChild(parrafoMedia);

}

function reiniciarTramite() {
    listaDeAportaciones = [];
    dineroTotalAportado = 0;
    numeroTotalDeAportaciones = 0;
    tramiteEstaFinalizado = false;
    document.getElementById('Resultados').innerHTML = '';
}
window.onload = function() {
    const contenedor = document.getElementById('contenedorPrincipal');
    const imagenes = contenedor.getElementsByClassName('logoImagen');

    Array.from(imagenes).forEach(function(imagen, indice) {
        imagen.addEventListener('click', function() {
            agregarAportacion(indice);
        });
    });
    let botonFinal = document.getElementById('botonFinal');
    botonFinal.addEventListener('click', mostrarResultados);
}