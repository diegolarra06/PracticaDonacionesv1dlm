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
    let conteoPorOrganizacion = new Array(valoresDeLasAportaciones.length).fill(0);

    for (let j = 0; j < listaDeAportaciones.length; j++) {
        conteoPorOrganizacion[listaDeAportaciones[j]]++;
    }

    let resumenDeAportaciones = [];
    const contenedor = document.getElementById('contenedorPrincipal');
    const organizaciones = contenedor.getElementsByClassName('OrganizacionesBeneficas');

    for (let k = 0; k < conteoPorOrganizacion.length; k++) {
        if (conteoPorOrganizacion[k] > 0) {
            const nombre = organizaciones[k].getElementsByClassName('nombreCausasBeneficas')[0].textContent;
            resumenDeAportaciones.push({ nombre: nombre, cantidad: conteoPorOrganizacion[k] });
        }
    }

    for (let m = 0; m < resumenDeAportaciones.length - 1; m++) {
        for (let n = m + 1; n < resumenDeAportaciones.length; n++) {
            if (resumenDeAportaciones[m].nombre < resumenDeAportaciones[n].nombre) {
                let temp = resumenDeAportaciones[m];
                resumenDeAportaciones[m] = resumenDeAportaciones[n];
                resumenDeAportaciones[n] = temp;
            }
        }
    }

    const contenedorResultados = document.getElementById('Resultados');
    contenedorResultados.innerHTML = '';

    for (let p = 0; p < resumenDeAportaciones.length; p++) {
        const parrafo = document.createElement('p');
        parrafo.textContent = resumenDeAportaciones[p].nombre + ' ---- ' + resumenDeAportaciones[p].cantidad + 
        (resumenDeAportaciones[p].cantidad > 1 ?   ' aportaciones' : ' aportación');
        contenedorResultados.appendChild(parrafo);
    }

    const parrafoTotal = document.createElement('p');
    parrafoTotal.textContent = 'Donación final: ' + dineroTotalAportado + ' €';
    contenedorResultados.appendChild(parrafoTotal);

    const parrafoMedia = document.createElement('p');
    const media = dineroTotalAportado / numeroTotalDeAportaciones;
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

window.onload = function () {
    const contenedor = document.getElementById('contenedorPrincipal');
    const imagenes = contenedor.getElementsByClassName('logoImagen');

    for (let i = 0; i < imagenes.length; i++) {
        imagenes[i].addEventListener('click', function () {         
            agregarAportacion(i);
        });
    }
    let botonFinal = document.getElementById('botonFinal');
    botonFinal.addEventListener('click', mostrarResultados);
};
